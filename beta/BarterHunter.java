package haven.automation;

import java.lang.reflect.*;
import java.lang.StringBuilder.*;
import java.util.*; 
import java.util.TimeZone; 

import java.io.*;
import java.nio.charset.Charset;
import java.text.SimpleDateFormat;

import haven.*;
import haven.resutil.*;
import haven.res.ui.tt.*;
import haven.res.ui.barterbox.* ;
import haven.res.ui.tt.q.qbuff.*;

import haven.Button;
import haven.Label;
import haven.Window;

import java.awt.*;
import java.awt.event.KeyEvent;

import static haven.OCache.posres;

public class BarterHunter extends Window /*implements GobSelectCallback*/ 
{ 
	private static final Text.Foundry infof = new Text.Foundry(Text.sans, 10).aa(true);
	
	private final Label lbl, lblc, lbls, lblstatus;
	private final Label lblctxt, lblstxt;
	public boolean pause = false;
	public boolean terminate = false;
	private Button resetbtn, runbtn, stopbtn, conbtn;
	private Thread runner;

	//private GameUI gui = gameui();
	private Gob barterstandGob;
	private Coord2d lcp, ncp;

	private boolean sloLoad = false;
	public String FN_htmlfile = ""; 
	public String FN_jsfile = ""; 
	public double BeaconX = 0;
	public double BeaconY = 0;
	public ArrayList<Long> BSvisitedId = new ArrayList<Long>();
	public ArrayList<Long> BSemptyId = new ArrayList<Long>();
	public ArrayList<String> datadump = new ArrayList<String>();
	public double standX = 0;
	public double standY = 0;
	public double dist = 12.0; //sets char's position in front of barterstand before and after grabbing stands content
	public double step = 28.0; //one step size. better keep it below a stand's width
	public double thresh = 7; //allows move char by checkpoints faster with less precision. 0.0 = best precision (does it even work?)
	public double angle = 0.6;
	public ArrayList<Double[]> CFCPlist = new ArrayList<Double[]>();

	public BarterHunter() 
	{
		super(new Coord(270, 180), "Barter Hunter");
		lbl = new Label("Please press [Run] at first barterstand", infof);
		add(lbl, new Coord(20, 50));

		lblctxt = new Label("Checkpoints left:", infof);
		lblctxt.hide();
		add(lblctxt, new Coord(20, 65));
		lblc = new Label("0", Text.num12boldFnd, Color.WHITE);
		lblc.hide();
		add(lblc, new Coord(110, 65));

		lblstxt = new Label("Stands visited:", infof);
		lblstxt.hide();
		add(lblstxt, new Coord(20, 80));
		lbls = new Label("0", Text.num12boldFnd, Color.WHITE);
		lbls.hide();
		add(lbls, new Coord(110, 80));

		lblstatus = new Label("", infof);
		add(lblstatus, new Coord(20, 95));

		runbtn = new Button(140, "Run") {
			@Override
			public void click() {
				terminate = false;
				pause = false;
				runner = new Thread(new Runner(), "Barter Hunter");
				runner.start();

				this.hide();
				stopbtn.show();
				conbtn.hide();
				resetbtn.hide();
				cbtn.hide();
				lbl.settext("Running");
				
				lblctxt.show();
				lblc.show();
				lblstxt.show();
				lbls.show();

			}
		};
		add(runbtn, new Coord(65, 140));

		stopbtn = new Button(140, "Pause") {
			@Override
			public void click() {
				pause = true;

				runbtn.hide();
				this.hide();
				conbtn.show();
				resetbtn.show();
				cbtn.hide();
				lbl.settext("Paused. Please don't move");
			}
		};
		stopbtn.hide();
		add(stopbtn, new Coord(65, 140));

		conbtn = new Button(140, "Continue") {
			@Override
			public void click() {
				pause = false;

				runbtn.hide();
				stopbtn.show();
				this.hide();
				resetbtn.hide();
				cbtn.hide();
				lbl.settext("Running");
			}
		};
		conbtn.hide();
		add(conbtn, new Coord(65, 140));

		resetbtn = new Button(140, "Reset") {
			@Override
			public void click() {
				pause = false;
				terminate = true;

				FN_htmlfile = ""; 
				BeaconX = 0;
				BeaconY = 0;
				BSvisitedId.clear();

				runbtn.show();
				stopbtn.hide();
				conbtn.hide();
				this.hide();
				cbtn.show();
				lbl.settext("Reseted. Press [Run] at the first barterstand");

				lblctxt.hide();
				lblc.hide();
				lblstxt.hide();
				lbls.hide();

				jsOut(datadump);
			}
		};
		resetbtn.hide();
		add(resetbtn, new Coord(65, 10));	
	}

	private class Runner implements Runnable {
		@Override
		public void run() 
		{
			init();			
			//MAIN CYCLE
			while( (CFCPlist.isEmpty() == false) || (CPReached(ncp) == false) )
			{
				
				if( terminate ) return;
				while( pause ) delay(500);

				if( CPReached(ncp) )
				{	
					lcp = ncp;
					ncp = getNCP();
				}	
				barterstandGob = getGob("gfx/terobjs/barterstand", 50.0, BSvisitedId);
				if( (barterstandGob == null) || !(bsOnPathway(lcp, ncp, barterstandGob.rc, 20)) ) 
				{
					step(ncp);
				}
				else 
				{	
					while( !readBS(barterstandGob) ) delay(100);
				}

				lblc.settext(CFCPlist.size() + "");
				lbls.settext(BSvisitedId.size() + "");
			}
			jsOut(datadump);
			lbl.settext("Finished");
			runbtn.show();
			stopbtn.hide();
			conbtn.hide();
			resetbtn.hide();
			cbtn.show();
			return;
		}
	}

	private void status(String message)
	{
		lblstatus.settext(message);
	}

	private void init()
	{
		FN_htmlfile = ""; 
		BeaconX = 0;
		BeaconY = 0;
		BSvisitedId.clear();
		BSemptyId.clear();
		datadump.clear();

		initCPList();
		barterstandGob = getGob("gfx/terobjs/barterstand", 50.0, BSvisitedId);
		if( barterstandGob == null ) 
		{
			terminate = true;
			System.out.println("No barterstands found. Stopped");
			return;
		}
		else 
		{
			readBS(barterstandGob);	
		}
				
		lcp = getNCP(); //first CP pops to "last checkpoint coords"
		ncp = getNCP(); //second CP pops to "next checkpoint coords"
	}

	private boolean delay(long time) //Pauses thread for time ms. Returns false on exception
	{
		try 
		{
			Thread.sleep(time);
		}
		catch(InterruptedException e)
		{
			Thread.currentThread().interrupt();
			return false;
		} 
		return true;
	}

	private boolean plrMoveTo(Coord2d c) //Make 10 retries to reach destination. After 3 fails enables pfmode. Returns true when destinatination reached
	{
		GameUI gui = gameui();
		Gob pl = gui.map.player();
		boolean destinationReached = false;
		byte retries = 0;
		byte maxRetries = 10;
		while( !destinationReached && retries < maxRetries )
		{
			while( pause ) delay(500);
			if( Config.pf || (retries > maxRetries/2) )
			{
				boolean currentPfStatus = Config.pf;
				Config.pf = true;
				gui.map.pfLeftClick(c.floor(), null);
				try 
				{
					gui.map.pfthread.join();
				} 
				catch (InterruptedException e) 	{		return false;		}
				Config.pf = currentPfStatus;
			} 
			else
			{
				gui.map.wdgmsg("click", pl.sc, c.floor(posres), 1, 0);
			}
			int t = 0;		
			while( (pl.getattr(Moving.class) == null) && (pl.rc.dist(c) > thresh) && (t < 10) )
			{
				delay(100);
				t++;
			}
			t = 0;
			while( (pl.getattr(Moving.class) != null) && (pl.rc.dist(c) > thresh) && (t < 100))
			{
				delay(100);
				t++;
			}
			if (pl.rc.dist(c) <= thresh) destinationReached = true;
			else retries++;
			if( retries > maxRetries ) gui.msg("I'm stuck");
		}
		return destinationReached;
	}

	private void jsOut(ArrayList<String> S){ //designed to write whole ArrayList S in one pass
		try {
			if (FN_jsfile == "") {
				SimpleDateFormat  gmtTimeFormat = new SimpleDateFormat("yyyy.MM.dd_HH-mm-ss");
				gmtTimeFormat.setTimeZone(TimeZone.getTimeZone("GMT"));
				FN_jsfile = gmtTimeFormat.format((new Date()));
				FN_jsfile = "marketlog\\"+FN_jsfile+".js";
			}
			OutputStreamWriter osw = new OutputStreamWriter(new FileOutputStream(FN_jsfile, true),
				Charset.forName("UTF-8").newEncoder());
			PrintWriter pw = new PrintWriter(osw, true);

			pw.print("var data = [\n");
			for( int i = 0; i < S.size(); i++ )
			{
				String line = S.get(i);
				line = line.replace("\t","").replace("\n","").replace("gfx/invobjs/",""); //JS compress
				pw.print(line + ((i < S.size()-1) ? "," : "") + "\n");
			}
			pw.print("]");
			

			pw.close();
		}
		catch (IOException e) {
			e.printStackTrace();
		}
	}

	private String HMtoJS(HashMap HM, String header, String keyname, String valname){ // gets <String, Integet/Doulbe> hashmap & returns concatenated strings
		if (HM.size() == 0) return "";
		StringBuilder result = new StringBuilder(1024);
		Set tempSet = HM.entrySet();
		Iterator tempIterator = tempSet.iterator();

		result.append(header + " : [\n");
		while (tempIterator.hasNext()) {
			Map.Entry hmEntry = (Map.Entry) tempIterator.next();
			String line = ("\t\t\t{ " + keyname + " : " + htmlQuotes((String)hmEntry.getKey()) + ", " + valname + " : " + hmEntry.getValue() + " },\n");
			result.append(line);
		}
		result.append("\t\t]");
		return result.toString();
	}

	private Gob getGob(String gobName, double maxrange, ArrayList<Long> skipIDList)  //search for nearest unvisited Gob in range
	{
		GameUI gui = gameui();
		Coord2d plc = gui.map.player().rc;
		Gob result = null;
		if( maxrange == 0 ) maxrange = 1024.0;
		synchronized (gui.map.glob.oc) {
			for (Gob gob : gui.map.glob.oc) {
				try {
					Resource res = gob.getres();
					if (res != null && res.name.startsWith(gobName)) 
					{
						if (skipIDList != null) //skip gob if visited before or marked to skip
							if (skipIDList.contains(gob.id)) 
							{
								continue;
							}
						if ((result == null || gob.rc.dist(plc) < result.rc.dist(plc)) && gob.rc.dist(plc) < maxrange) 
							result = gob;
					}
				} 
				catch (Loading l) {		}
			}
		}
		return result;
	}

	private Window waitForWindow(String windowname, int retries, long d)
	{
		GameUI gui = gameui();
		Window result = gui.getwnd(windowname);;
		int tried = 0;
		while( result == null && tried < retries )
		{
			result = gui.getwnd(windowname);
			tried++;
			delay(d);
		}
		return result;
	}

	private int waitForBSReady()  //returns amount of empty shopboxes or -1 on error
	{
		GameUI gui = gameui();
		Long now = System.currentTimeMillis();
		Shopbox probeSB = null;
		Boolean loaded = false;
		int emptyBoxes = 0;
		while (((probeSB == null) || (loaded == false)) && emptyBoxes < 5 && System.currentTimeMillis() - now < 5000) 
		{
			
			loaded = false;
			emptyBoxes = 0;

			Window w = waitForWindow("Barter Stand", 5, 50);
			for (Widget sw = w.lchild; sw != null; sw = sw.prev) 
				if (sw instanceof Shopbox) 
				{
					probeSB = (Shopbox) sw;
					try
					{
						if( (probeSB.price == null) || (probeSB.res == null) ) emptyBoxes++;
						else if( (probeSB.price.getres() != null) && (probeSB.getres() != null) ) loaded = true;
					}
					catch (Loading l) 
					{
					 loaded = false;	
					}
					catch (Exception e)
					{
						gui.error("waitForBSReady error: "+e+"\n\n");
						return -1;
					}
				}
		}
		return emptyBoxes;
	}

	private boolean readBS(Gob barterstandGob)
	{
		GameUI gui = gameui();
		
		status("Storing coords");
		if ((BeaconX == 0) || (BeaconY == 0))
		{
			BeaconX = barterstandGob.rc.x;
			BeaconY = barterstandGob.rc.y;
		}
		standX = barterstandGob.rc.x - BeaconX;
		standY = barterstandGob.rc.y - BeaconY;

		status("Approaching bs");
		if( getGob("gfx/terobjs/stockpile", 12.0, null) != null ) 
		{
			dist = 23.0;
			angle = 0.5;
		}
		else
		{
			angle = 0.6;
			dist = 11.0;
		} 
		thresh = 2.0;

		Window bsw = null;
		while( bsw == null )
		{
			Coord2d mc = new Coord2d (barterstandGob.rc.x + Math.cos(barterstandGob.a+angle)*dist, barterstandGob.rc.y + Math.sin(barterstandGob.a+angle)*dist);
			while( !plrMoveTo(mc) )
			{
				delay(50);
			} 
			gui.map.wdgmsg("click", barterstandGob.sc, barterstandGob.rc.floor(posres), 3, 0, 0, (int) barterstandGob.id, barterstandGob.rc.floor(posres), 0, -1);		
			bsw = waitForWindow("Barter Stand", 5, 50);
			delay(50);
		}
		
		status("Reading bs data");
		if( sloLoad ) delay(1000); //wait a bit to allow resources to cache

		if (waitForBSReady() >= 5) //if all 5 Shopbox are empty
		{
			BSvisitedId.add(barterstandGob.id);
			return true;
		}
		else
		{
			ArrayList<String> ShopboxData = new ArrayList<String>();
			ArrayList<String> ShopboxDataHTML = new ArrayList<String>();
			try 
			{
				for (Widget sw = bsw.lchild; sw != null; sw = sw.prev) 
					if (sw instanceof Shopbox) {
						Shopbox SB = (Shopbox) sw;

						String num = "";
						String q = "";
						String name = "";
						//String misc = "";
						String res = "";

						String pname = "";
						String pq = "";
						String pnum = "";
						String pres = "";

						String miscJS = "null";
						String pmiscJS = "null";

						HashMap DAttrBonuses = new HashMap<String, Integer>();
						HashMap DAGBonuses = new HashMap<String, Integer>();
						HashMap DIngredients = new HashMap<String, Double>();

						ArrayList<String> detJS = new ArrayList<String>(); //arrayList of detail JS-object properties 
			
						if ((SB.num != null)) {
							num = SB.num.text.split(" ")[0];
						}

						if ((SB.res != null)) {
							try {
								res = "" + SB.res.res.get().name;
							} 
							catch( Loading l ) { }
							catch( Exception e ) { gui.error("SB.res.res.get().name: " + e); }
						}

						if (SB.info() != null) {
							Object[] SB_info = SB.info().toArray(); 
							for (int j = 0; j < SB_info.length; j++) {
								if (SB_info[j] instanceof ItemInfo) {
									ItemInfo str = (ItemInfo) SB_info[j];

									if (str instanceof ItemInfo.Name) {
										ItemInfo.Name str3 = (ItemInfo.Name) str;
										name = str3.str.text;
									}

									if (str instanceof QBuff) {
										QBuff str2 = (QBuff) str;
										q += (int) str2.q;
									}

									if (str.getClass().getName().contains("Gast")) {
										try {
											Field F_glut = str.getClass().getField("glut");
											Field F_fev = str.getClass().getField("fev");
											double V_glut = (double)F_glut.get(str);
											double V_fev = (double)F_fev.get(str);
											detJS.add("hmod : " + V_glut);
											detJS.add("fmod : " + V_fev);
										}
										catch (Exception e) { gui.error("Gast grab error: "+e); }
									}								

									if (str.getClass().getName().contains("Slotted")) { //As gilding
										try {
											Field F_SlottedItemInfo = str.getClass().getField("sub");
											ArrayList<ItemInfo> V_SlottedItemInfo = (ArrayList<ItemInfo>) F_SlottedItemInfo.get(str);
											for (int k1 = 0; k1 < V_SlottedItemInfo.size(); k1++){
												if (V_SlottedItemInfo.get(k1).getClass().getName().contains("AttrMod")) {
													Field F_mods = V_SlottedItemInfo.get(k1).getClass().getField("mods");
													ArrayList V_mods = (ArrayList) F_mods.get(V_SlottedItemInfo.get(k1));
													for (int k2 = 0; k2 < V_mods.size(); k2++) {
														Field F_attr = V_mods.get(k2).getClass().getField("attr");
														Field F_mod = V_mods.get(k2).getClass().getField("mod");
														String V_attr = ((Resource)F_attr.get(V_mods.get(k2))).basename();
														int V_mod = (int)F_mod.get(V_mods.get(k2));
														if (DAGBonuses.containsKey(V_attr)) {
															DAGBonuses.put(V_attr, (int)DAGBonuses.get(V_attr)+V_mod);
														}
														else {
															DAGBonuses.put(V_attr, V_mod);	
														}			
													}
												}
											}

										}
										catch (Exception e) { gui.error("Slotted grab error: "+e); }
									}	

									if (str.getClass().getName().contains("AttrMod")) {
										try {
											Field modsArrayField = str.getClass().getField("mods");
											ArrayList modsArray = (ArrayList)modsArrayField.get(str);
											for (int k = 0; k < modsArray.size(); k++){
												Field F_modsArrayAttr = modsArray.get(k).getClass().getField("attr");
												Field F_modsArrayMod = modsArray.get(k).getClass().getField("mod");
												String V_modsArrayAttr = ((Resource)F_modsArrayAttr.get(modsArray.get(k))).basename();
												int V_modsArrayMod = (int) F_modsArrayMod.get(modsArray.get(k));
												if (DAttrBonuses.containsKey(V_modsArrayAttr)) {
													DAttrBonuses.put(V_modsArrayAttr, (int)DAttrBonuses.get(V_modsArrayAttr)+V_modsArrayMod);
												}
												else {
													DAttrBonuses.put(V_modsArrayAttr, V_modsArrayMod);	
												}
											}
										}
										catch(Exception e) {
											gui.error("error: " + e);
										}	
									}

									if (str instanceof ItemInfo.Contents) {
										if( res.contains("primrod") || res.contains("bushpole") ) continue;
										String contents = "";
										String contentsQ = "";
										ItemInfo.Contents tempContents = (ItemInfo.Contents) str;
										Object [] arraySub = tempContents.sub.toArray();
										for (int i = 0; i < arraySub.length; i++) {
											if (arraySub[i] instanceof ItemInfo.Name) {
												ItemInfo.Name contentName = (ItemInfo.Name) arraySub[i];
												if (contentName.str != null) {
													contents += contentName.str.text;
												}
											}
											if (arraySub[i] instanceof QBuff) {
												QBuff contentQ = (QBuff) arraySub[i];
												contentsQ += (int) contentQ.q;
											}
										}
										String bufferName = name;
										name = contents;
										detJS.add("vessel : { vesselName : " + htmlQuotes(bufferName) + ", vesselQ : " + (q.isEmpty() ? "0" : q) + " }");
										q = contentsQ;
									}

									if (str.getClass().getName().contains("ISlots")) { //All gildings info in one object. No need for "banking" HM
										ArrayList<String> ALgilds = new ArrayList<String>();
										HashMap DGildBonuses = new HashMap<String, Integer>();
										try {
											Field leftField = str.getClass().getField("left");
											int left = (int)leftField.get(str);

											Field sField = str.getClass().getField("s");
											Collection<Object> SItemCollection = (Collection<Object>)sField.get(str);
											Object[] gildings = SItemCollection.toArray();

											for (int i = 0; i < gildings.length; i++)
											{
												Field snameField = gildings[i].getClass().getField("name");
												ALgilds.add((String)snameField.get(gildings[i]));

												java.util.List<Object> sinfoList = (java.util.List<Object>)gildings[i].getClass().getField("info").get(gildings[i]);
												Object [] sinfoArray = sinfoList.toArray();
												for (int k = 0; k < sinfoArray.length; k++) {
													if (sinfoArray[k].getClass().getName().contains("AttrMod")) {
														try {
															Field modsArrayField = sinfoArray[k].getClass().getField("mods");
															ArrayList modsArray = (ArrayList)modsArrayField.get(sinfoArray[k]);
															for (int l = 0; l < modsArray.size(); l++){
																Field F_modsArrayAttr = modsArray.get(l).getClass().getField("attr");
																Field F_modsArrayMod = modsArray.get(l).getClass().getField("mod");
																String V_modsArrayAttr = ((Resource)F_modsArrayAttr.get(modsArray.get(l))).basename();
																int V_modsArrayMod = (int) F_modsArrayMod.get(modsArray.get(l));

																if (DGildBonuses.containsKey(V_modsArrayAttr)) {
																	DGildBonuses.put(V_modsArrayAttr, (int)DGildBonuses.get(V_modsArrayAttr)+V_modsArrayMod);
																}
																else {
																	DGildBonuses.put(V_modsArrayAttr, V_modsArrayMod);	
																}
															}
														}
														catch(Exception e) { gui.error("ISlots read error: " + e);	}	
													}
												}
											}
											if (left > 0) {
												String emptySlots = "Gildable";
												if (left > 1) {
													emptySlots += (" x"+left);
												}
												ALgilds.add(emptySlots);
											}

											StringBuilder outGilds = new StringBuilder(1024);
											outGilds.append("gildings : {\n");

												outGilds.append("\t\t\t" + "gildn : ").append(gildings.length).append(",\n");

												outGilds.append("\t\t\tgilds : [\n");
												for( int m = 0; m < ALgilds.size(); m++)
													outGilds.append("\t\t\t\t" + htmlQuotes(ALgilds.get(m))).append(",\n");
												outGilds.append("\t\t\t], \n");

												if (DGildBonuses.size() > 0)
													outGilds.append("\t\t" + HMtoJS(DGildBonuses, "gildm", "atr", "mod"));

											outGilds.append("\n\t\t}");
											detJS.add(outGilds.toString());
										}
										catch (Exception e){ gui.error("Gildings read error: "+e); }
									}

									if (str instanceof FoodInfo) {
										HashMap hmFEP = new HashMap<String, Double>();
										FoodInfo tempFoodInfo = (FoodInfo) str;
										for (int k = 0; k < tempFoodInfo.evs.length; k++) {
											String nm = tempFoodInfo.evs[k].ev.nm.toLowerCase();
											String atr = (nm.substring(0, 3)).replace("per", "prc").replace("cha", "csm") + " " + nm.substring(nm.length()-2, nm.length());
											double a = tempFoodInfo.evs[k].a;
											hmFEP.put(atr, a);
										}

										if( hmFEP.size() > 0)
											detJS.add(HMtoJS(hmFEP, "fep", "atr", "mod"));
										detJS.add("fnrj : " + tempFoodInfo.end);
										detJS.add("fhng : " + tempFoodInfo.glut);
									}

									if (str.getClass().getName().contains("Coinage")) {
										try {
											Field coinNameField = str.getClass().getField("nm");
											String coinFieldVal = "" + coinNameField.get(str);
											detJS.add("coinage : " + htmlQuotes(coinFieldVal));
										} catch (Exception e){ gui.error("Coinage read error: "+e);	}
									}

									if (str.getClass().getName().contains("Ingredient")) {
										try {
											Field ingNameField = str.getClass().getField("name");
											Field ingAmField = str.getClass().getField("val");
											String ingNameVal = "" + ingNameField.get(str);
											Double ingAmVal = (Double) ingAmField.get(str);
											DIngredients.put(ingNameVal, ingAmVal);
										} catch (Exception e){ gui.error("Ingredient read error: "+e);	}
									}

									if (str.getClass().getName().contains("Armpen")) {
										try {
											Double armpen = (Double)str.getClass().getField("deg").get(str);
											detJS.add("armpen : " + armpen);
										} catch (Exception e){ gui.error("Armpen read error: "+e);	}
									}

									if (str.getClass().getName().contains("Weight")) {
										try {
											String weight = ((Resource)str.getClass().getField("attr").get(str)).basename();
											detJS.add("weight : " + htmlQuotes(weight));
										} catch (Exception e){ gui.error("Weight read error: "+e);	}
									}

									if (str.getClass().getName().contains("Damage")) {
										try {
											Field damage = str.getClass().getField("dmg");
											detJS.add("damage : " + damage.get(str));
										} catch (Exception e){ gui.error("Damage read error: "+e);	}
									}

									if (str.getClass().getName().contains("Armor")) {
										try {
											Field hard = str.getClass().getField("hard");
											Field soft = str.getClass().getField("soft");
											String armor = "armor : { hard : " + hard.get(str) + ", soft : " + soft.get(str) + " }";
											detJS.add(armor);
									} catch (Exception e){ gui.error("Armor read error: "+e);	}
									}

									if (str.getClass().getName().contains("Curiosity")) {
										try {
											Field time = str.getClass().getField("time");
											Field xp = str.getClass().getField("enc");
											Field lp = str.getClass().getField("exp");
											Field mw = str.getClass().getField("mw");
											String curio = "curio : { lp : " + lp.get(str) + ", xp : " + xp.get(str) + ", mw : " + mw.get(str) + ", time : " + time.get(str) + " }";
											detJS.add(curio);
										} catch (Exception e){ gui.error("Curio read error: "+e);	}
									}

									if (str instanceof Wear) {
										try {
											Wear itemWear = (Wear) str;
											int d = (int)itemWear.d;
											int m = (int)itemWear.m;
											String wear = "wear : { d : " + d + ", m : " + m + " }";
											detJS.add(wear);
										} catch (Exception e){ gui.error("Wear read error: "+e);	}
									}
								}
							}
						}

						if (SB.price != null){
							pname += SB.price.name();  

							pnum += SB.pnum;

							if (SB.pq == 0) 
								pq = htmlQuotes("Any");
							else 
								pq += (int) SB.pq;

							if ((SB.price.res != null)){
								try {
									pres = "" + SB.price.res.res.get().name;
								}
								catch( Exception e ) { gui.error("Price resource read error: " + e);}
							}

							Object[] SB_pinfo = SB.price.info().toArray(); 
							for (int j = 0; j<SB_pinfo.length; j++) {
								if (SB_pinfo[j] instanceof ItemInfo) {
									ItemInfo str = (ItemInfo) SB_pinfo[j];
									if (str.getClass().getName().contains("Coinage")) {
										try {
											Field coinNameField = str.getClass().getField("nm");
											String coinFieldVal = "" + coinNameField.get(str);
											pmiscJS = htmlQuotes(coinFieldVal);
										}
										catch (Exception e){
											gui.error("!! Price coinage: "+e+" !!");		
										}
									}
								}
							}
						} 

						if( DAGBonuses.size() > 0)
							detJS.add(HMtoJS(DAGBonuses, "gilding", "atr", "mod"));
						if( DAttrBonuses.size() > 0)
							detJS.add(HMtoJS(DAttrBonuses, "atrm", "atr", "mod"));
						if( DIngredients.size() > 0)
							detJS.add(HMtoJS(DIngredients, "madeof", "ing", "frc"));

						try {
							if(  detJS.size() > 0 ) {
								StringBuilder sbMiscJS = new StringBuilder (4096);
								sbMiscJS.append("{\n");
								for( int k1 = 0; k1 < detJS.size(); k1++ ){
									sbMiscJS.append("\t\t" + detJS.get(k1));
									sbMiscJS.append((( k1 < detJS.size()-1 ) ? "," : "") + "\n");
								}
								sbMiscJS.append("\t}");
								miscJS = sbMiscJS.toString();
							}
						} catch (Exception e){ gui.error("\n \n !! JS misc-data build error: "+e+" !! \n \n "); }

						SimpleDateFormat  gmtTimestampTimeFormat = new SimpleDateFormat("yyyy/MM/dd HH:mm");
						gmtTimestampTimeFormat.setTimeZone(TimeZone.getTimeZone("GMT"));
						String timestamp = gmtTimestampTimeFormat.format((new Date())) + " UTC";

						String spt = ",\n\t";
						if( (name != "") && (pname != "") ) {
							String stroutJS = "[\n\t" + htmlQuotes(res) + spt + htmlQuotes(name) + spt + miscJS + spt + q + spt + num + spt + htmlQuotes(pres) + spt + htmlQuotes(pname) + spt + pmiscJS + spt + pq + spt + pnum + spt + standX + spt + standY + spt + htmlQuotes(timestamp) + "\n]";
							datadump.add(stroutJS);
						}
					}

				BSvisitedId.add(barterstandGob.id);
				sloLoad = false;
				closeBS(barterstandGob);
				return true;
			}
			catch (Loading l) 
			{ 
				closeBS(barterstandGob);
				// gui.error("Barterstand read error: " + l); 
				sloLoad = true;
				return false;
			}
		}
	}

	private String htmlQuotes(String input)
	{
		String result = "";
		result = "\"" + input.replace("\'", "&#39;").replace("\"","&#34;") + "\"";
		return result;
	}

	private void closeBS(Gob barterstandGob)
	{
		GameUI gui = gameui();
		status("Leaving bs");
		if( getGob("gfx/terobjs/stockpile", 12.0, null) != null )
		{
			dist = 23.0;
			angle = 0.5;
		}
		else
		{
			angle = 0.6;
			dist = 11.0;
		} 
		thresh = 8.0;
		Coord2d mc = new Coord2d (barterstandGob.rc.x + Math.cos(barterstandGob.a+angle)*dist, barterstandGob.rc.y + Math.sin(barterstandGob.a+angle)*dist);
		plrMoveTo(mc);
		while( waitForWindow("Barter Stand", 2, 10) != null ) delay(50); //wait for window to close
	}

	private void initCPList()
	{	
		CFCPlist.clear();
		CFCPlist.add(new Double[]{0.0, -16.0});
		CFCPlist.add(new Double[]{1345.0, -16.0});
		CFCPlist.add(new Double[]{1351.0, 0.0});
		CFCPlist.add(new Double[]{1368.0, 5.0});
		CFCPlist.add(new Double[]{1367.0, 1303.0});
		CFCPlist.add(new Double[]{1425.0, 1303.0});
		CFCPlist.add(new Double[]{1424.0, 412.0});
		CFCPlist.add(new Double[]{1438.0, 405.0});
		CFCPlist.add(new Double[]{1423.0, 390.0});
		CFCPlist.add(new Double[]{1423.0, -24.0});
		CFCPlist.add(new Double[]{2413.0, -14.0});
		CFCPlist.add(new Double[]{2414.0, -1225.0});
		CFCPlist.add(new Double[]{2353.0, -1180.0});
		CFCPlist.add(new Double[]{1908.0, -1180.0});
		CFCPlist.add(new Double[]{1884.0, -1237.0});
		CFCPlist.add(new Double[]{1884.0, -1292.0});
		CFCPlist.add(new Double[]{1858.0, -1293.0});
		CFCPlist.add(new Double[]{1913.0, -1293.0});
		CFCPlist.add(new Double[]{1885.0, -1293.0});
		
		CFCPlist.add(new Double[]{1890.0, -1226.0});
		CFCPlist.add(new Double[]{1500.0, -1226.0});
		CFCPlist.add(new Double[]{1890.0, -1226.0});

		CFCPlist.add(new Double[]{1890.0, -935.0});
		CFCPlist.add(new Double[]{1910.0, -941.0});
		CFCPlist.add(new Double[]{2353.0, -940.0});
		CFCPlist.add(new Double[]{2341.0, -868.0});
		CFCPlist.add(new Double[]{2336.0, -885.0});
		CFCPlist.add(new Double[]{1912.0, -885.0});
		CFCPlist.add(new Double[]{1922.0, -869.0});
		CFCPlist.add(new Double[]{1907.0, -868.0});
		CFCPlist.add(new Double[]{1908.0, -115.0});
		CFCPlist.add(new Double[]{1862.0, -121.0});
		CFCPlist.add(new Double[]{1862.0, -577.0});
		CFCPlist.add(new Double[]{1847.0, -572.0});
		CFCPlist.add(new Double[]{1841.0, -587.0});
		CFCPlist.add(new Double[]{1456.0, -587.0});
		CFCPlist.add(new Double[]{1439.0, -572.0});
		CFCPlist.add(new Double[]{1423.0, -566.0});
		CFCPlist.add(new Double[]{1424.0, -116.0});
		CFCPlist.add(new Double[]{1365.0, -120.0});
		CFCPlist.add(new Double[]{1367.0, -572.0});
		CFCPlist.add(new Double[]{1350.0, -571.0});
		CFCPlist.add(new Double[]{1346.0, -588.0});
		CFCPlist.add(new Double[]{928.0, -588.0});
		CFCPlist.add(new Double[]{934.0, -572.0});
		CFCPlist.add(new Double[]{917.0, -566.0});
		CFCPlist.add(new Double[]{917.0, -117.0});
		CFCPlist.add(new Double[]{871.0, -121.0});
		CFCPlist.add(new Double[]{871.0, -1245.0});
		CFCPlist.add(new Double[]{890.0, -1245.0});
		CFCPlist.add(new Double[]{890.0, -15.0});
		CFCPlist.add(new Double[]{-27.0, -15.0});
		CFCPlist.add(new Double[]{-28.0, -74.0});
		CFCPlist.add(new Double[]{860.0, -72.0});
		CFCPlist.add(new Double[]{856.0, -87.0});
		CFCPlist.add(new Double[]{934.0, -87.0});
		CFCPlist.add(new Double[]{939.0, -72.0});
		CFCPlist.add(new Double[]{1345.0, -72.0});
		CFCPlist.add(new Double[]{1351.0, -87.0});
		CFCPlist.add(new Double[]{1439.0, -88.0});
		CFCPlist.add(new Double[]{1444.0, -71.0});
		CFCPlist.add(new Double[]{1841.0, -71.0});
		CFCPlist.add(new Double[]{1846.0, -87.0});
		CFCPlist.add(new Double[]{1923.0, -87.0});
		CFCPlist.add(new Double[]{1929.0, -71.0});
		CFCPlist.add(new Double[]{2335.0, -72.0});
		CFCPlist.add(new Double[]{2341.0, -88.0});
		CFCPlist.add(new Double[]{2357.0, -93.0});
		CFCPlist.add(new Double[]{2356.0, -862.0});
		CFCPlist.add(new Double[]{2340.0, -869.0});
		CFCPlist.add(new Double[]{2342.0, -956.0});
		CFCPlist.add(new Double[]{2357.0, -961.0});
		CFCPlist.add(new Double[]{2354.0, -1179.0});
	}

	private boolean CPReached(Coord2d CP)
	{
		GameUI gui = gameui();
		Gob pl = gui.map.player();
		return (pl.rc.dist(CP) < thresh);
	}

	private Coord2d getNCP() //don't call before Beacon coords are setted. Pops CP coords from CPs list
	{
		Coord2d CP = new Coord2d(BeaconX+CFCPlist.get(0)[0], BeaconY+CFCPlist.get(0)[1]);
		CFCPlist.remove(0);
		return(CP);
	}

	private void step(Coord2d CP) //single step between checkpoints
	{
		GameUI gui = gameui();
		Gob pl = gui.map.player();
		Coord2d nextstep;
		double steps = pl.rc.dist(CP) / step; //total amount of steps
		if( steps < 1 )
		{
			nextstep = new Coord2d(CP.x, CP.y);
		}
		else
		{
			double tx = (CP.x - pl.rc.x) / steps + pl.rc.x;
			double ty = (CP.y - pl.rc.y) / steps + pl.rc.y;
			nextstep = new Coord2d(tx, ty);	
		}
		thresh = 11.0;
		status("Moving along");
		while( !plrMoveTo(nextstep) ) 
		{
			delay(500);
		}
	}

	private double distToPathway (Coord2d a, Coord2d b, Coord2d c)  //return sqr(dist) from BS to current pathway line
	{
		double ac = a.dist(c);
		double ab = a.dist(b);
		double bc = b.dist(c);
		double f = (ac*ac + ab*ab - bc*bc) / 2 / ab;
		return (ac*ac - f*f);
	}

	private boolean bsOnPathway (Coord2d a, Coord2d b, Coord2d c, double range)
	{
		boolean result = false;
		double ac = a.dist(c);
		double ab = a.dist(b);
		double bc = b.dist(c);
		double f = (ac*ac + ab*ab - bc*bc) / 2 / ab;
		double h = Math.sqrt( (ac*ac - f*f) );
		double dmax = Math.sqrt( (ab*ab + range*range) ) + range;
		double dact = ac + bc;
		System.out.println("Dmax: " + (int)dmax + "   Dact: " + (int)dact + "   h: " + (int)h);
		if( (dact < dmax) && (h < range) ) result = true;
		else
			if ( (ac < range) || (bc < range) ) result = true;
		return result;
	}

	@Override
	public void wdgmsg(Widget sender, String msg, Object... args) {
		if (sender == cbtn)
			reqdestroy();
		else
			super.wdgmsg(sender, msg, args);
	}

	@Override
	public boolean type(char key, KeyEvent ev) {
		if (key == 27) {
			if (cbtn.visible)
				reqdestroy();
			return true;
		}
		return super.type(key, ev);
	}

	public void terminate() {
		terminate = true;
		if (runner != null)
			runner.interrupt();
		this.destroy();
	}
}