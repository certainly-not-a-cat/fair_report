package haven.automation;

import java.lang.reflect.*;
import java.util.*; 

import java.io.*;
import java.nio.charset.Charset;
import java.text.SimpleDateFormat;

import haven.*;
import haven.resutil.*;
import haven.res.ui.tt.*;
import haven.res.ui.barterbox.* ;
import haven.res.ui.tt.q.qbuff.*;
import static haven.OCache.posres;

public class Plus implements Runnable {
	private GameUI gui;
	public static String FN_htmlfile = ""; 
	public static double BeaconX = 0;
	public static double BeaconY = 0;
	public static ArrayList<Long> BSvisitedId = new ArrayList<Long>();
	public double standX = 0;
	public double standY = 0;
	public Double dist = 13.5; //sets players position in front of barterstand befpre and after parsing its content

	public Plus(GameUI gui) {
		this.gui = gui;
	}

	private void plrMoveTo(Coord2d c){
		Gob pl = gui.map.player();
		if (Config.pf) {
			gui.map.pfLeftClick(c.floor(), null);
			try {
				gui.map.pfthread.join();
			} catch (InterruptedException e) {
				return;
			}
		} else {
			gui.map.wdgmsg("click", pl.sc, c.floor(posres), 1, 0);
		}		
		Long pmtnow = System.currentTimeMillis();
		while (System.currentTimeMillis() - pmtnow < 3000 && pl.getattr(Moving.class) == null){
			try {
				Thread.sleep(50);
			}
			catch(InterruptedException e) { Thread.currentThread().interrupt(); }
		}
		pmtnow = System.currentTimeMillis();
		while (System.currentTimeMillis() - pmtnow < 30000 && pl.getattr(Moving.class) != null){
			try {
				Thread.sleep(50);
			}
			catch(InterruptedException e) { Thread.currentThread().interrupt(); }
		}
	}

	private void htmlOut(String S){
		try {
			if (FN_htmlfile == "") {
				FN_htmlfile = new SimpleDateFormat("yyyy.MM.dd_HH-mm-ss").format((new Date()));
				FN_htmlfile = "marketlog\\"+FN_htmlfile+".html";
			}
			OutputStreamWriter osw = new OutputStreamWriter(new FileOutputStream(FN_htmlfile, true),
				Charset.forName("UTF-8").newEncoder());
			PrintWriter pw = new PrintWriter(osw, true);
			pw.print(S);
			pw.close();
		}
		catch (IOException e) {
			e.printStackTrace();
		}
	}



	@Override
	public void run() {
		Gob barterstandGob = null;
		synchronized (gui.map.glob.oc) {
			for (Gob gob : gui.map.glob.oc) {
				try {
					Resource res = gob.getres();
					if (res != null && res.name.startsWith("gfx/terobjs/barterstand")) {
						Coord2d plc = gui.map.player().rc;
						if ((barterstandGob == null || gob.rc.dist(plc) < barterstandGob.rc.dist(plc)) && (BSvisitedId.contains(gob.id) == false) && gob.rc.dist(plc) < 65.0) 
							barterstandGob = gob;
					}
				} catch (Loading l) {				}
			}
		}
		if (barterstandGob == null) return;

		
		Coord2d mc = new Coord2d (barterstandGob.rc.x + Math.cos(barterstandGob.a+0.4)*dist, barterstandGob.rc.y + Math.sin(barterstandGob.a+0.4)*dist);
		plrMoveTo(mc);
		

		gui.map.wdgmsg("click", barterstandGob.sc, barterstandGob.rc.floor(posres), 3, 0, 0, (int) barterstandGob.id, barterstandGob.rc.floor(posres), 0, -1);
		if ((BeaconX == 0) || (BeaconY == 0))
		{
			BeaconX = barterstandGob.rc.x;
			BeaconY = barterstandGob.rc.y;
		}
		standX = barterstandGob.rc.x - BeaconX;
		standY = barterstandGob.rc.y - BeaconY;
		
		Long now = System.currentTimeMillis();
		Shopbox probeSB = null;
		Shopbox SB = null;
		Boolean loaded = false;
		int emptyBoxes = 0;
		while (((probeSB == null) || (loaded == false)) && emptyBoxes < 5 && System.currentTimeMillis() - now < 30000) {
			try {
				loaded = false;
				emptyBoxes = 0;
				for (Widget w = gui.lchild; w != null; w = w.prev) 
					if (w instanceof Window)
						for (Widget sw = w.lchild; sw != null; sw = sw.prev)
							if (sw instanceof Shopbox) {
								probeSB = (Shopbox) sw;
								try {
									if ((probeSB.price == null)||(probeSB.res == null)) {
										emptyBoxes++;
									}
									else
										if ((probeSB.price.getres() != null)&&(probeSB.getres() != null)) loaded = true;
								}
								catch (Loading l) {
									loaded = false;	
								}
								catch (Exception e) {
									gui.error("Loading TO error: "+e+"\n\n");
								}
							}
							Thread.sleep(200);
						}
						catch (InterruptedException e) { Thread.currentThread().interrupt(); }
					}

					long read_time = System.currentTimeMillis();
					if (emptyBoxes >= 5)
						BSvisitedId.add(barterstandGob.id);
					else
						if ((probeSB != null) && (loaded != false)) {
							ArrayList<String> ShopboxData = new ArrayList<String>();
							ArrayList<String> ShopboxDataHTML = new ArrayList<String>();
							try {
								for (Widget w = gui.lchild; w != null; w = w.prev) 
									if (w instanceof Window)
										for (Widget sw = w.lchild; sw != null; sw = sw.prev) 
											if (sw instanceof Shopbox) {
												SB = (Shopbox) sw;

												
												String num = "";
												String q = "";
												String name = "";
												String misc = "";

												ArrayList<ArrayList<String>> det = new ArrayList<ArrayList<String>>();
												
												HashMap DAttrBonuses = new HashMap<String, Integer>();
												HashMap DGildBonuses = new HashMap<String, Integer>();
												HashMap DAGBonuses = new HashMap<String, Integer>();

												ArrayList<String> DIngredients = new ArrayList<String>();

												if ((SB.num != null)) {
													num = SB.num.text.split(" ")[0];
												}
												if (SB.info() != null) {
													Object[] SB_info = SB.info().toArray(); 
													for (int j = 0; j<SB_info.length; j++) {
														if (SB_info[j] instanceof ItemInfo) {
															ItemInfo str = (ItemInfo) SB_info[j];

															/* OBJECT BUTCHER 
															try{
																System.out.print(str.getClass().getName());
																Field [] coinFields = str.getClass().getFields();
																for (int k = 0; k < coinFields.length; k++) {
																	String coinFieldName = "" + coinFields[k].getName();
																	String coinFieldVal = "" + coinFields[k].get(str);
																	java.lang.System.out.print("\n"+coinFieldName+": "+coinFieldVal.getClass().getName()+"  "+coinFieldVal);
																}
																java.lang.System.out.print("\n");
															}
															catch (Exception e) {System.out.println("Butcher:" + e);}
															*/

															if (str.getClass().getName().contains("Gast")) {
																ArrayList<String> ALfev = new ArrayList<String>();
																ArrayList<String> ALhng = new ArrayList<String>();
																try {
																	Field F_glut = str.getClass().getField("glut");
																	Field F_fev = str.getClass().getField("fev");
																	double V_glut = (double)F_glut.get(str);
																	double V_fev = (double)F_fev.get(str);
																	ALhng.add("Hunger mod: ");
																	ALfev.add("FEP mod: ");
																	ALhng.add(Math.round(V_glut*1000)/10D + "%");
																	ALfev.add(Math.round(V_fev*1000)/10D + "%");
																}
																catch (Exception e) {																	gui.error("Gast grab error: "+e);																}
																det.add(ALhng);
																det.add(ALfev);
															}								

															if (str.getClass().getName().contains("Slotted")) {
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
																catch (Exception e) {																	gui.error("Slotted grab error: "+e);																}
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
															if (str instanceof QBuff) {
																QBuff str2 = (QBuff) str;
																q += (int) str2.q;
															}
															if (str instanceof ItemInfo.Name) {
																ItemInfo.Name str3 = (ItemInfo.Name) str;
																name += str3.str.text;
															}
															if (str instanceof ItemInfo.Contents) {
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
																String tempBuffer = name;
																name = contents;
																ArrayList<String> ALcontent = new ArrayList<String>();
																ALcontent.add(tempBuffer + " Q" + q);
																det.add(ALcontent);
																q = contentsQ;
															}

															if (str.getClass().getName().contains("ISlots")) {
																ArrayList<String> ALgilds = new ArrayList<String>();
																try {
																	Field leftField = str.getClass().getField("left");
																	int left = (int)leftField.get(str);
																	Field sField = str.getClass().getField("s");
																	Collection<Object> SItemCollection = (Collection<Object>)sField.get(str);
																	Object[] gildings = SItemCollection.toArray();
																	ALgilds.add("Gildings (" + gildings.length + "): ");
																	for (int i = 0; i < gildings.length; i++)
																	{
																		Field snameField = gildings[i].getClass().getField("name");
																		ALgilds.add((String)snameField.get(gildings[i]));

																		List<Object> sinfoList = (List<Object>)gildings[i].getClass().getField("info").get(gildings[i]);
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
																				catch(Exception e) { gui.error("error: " + e);	}	
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
																}
																catch (Exception e){
																	gui.error("!! Gildings "+e+" !!");		
																}
																det.add(ALgilds);
															}

															if (str instanceof FoodInfo) {
																ArrayList<String> ALfep = new ArrayList<String>();
																ALfep.add("FEP: ");
																FoodInfo tempFoodInfo = (FoodInfo) str;
																String end = Math.round(tempFoodInfo.end*100) + "%";
																String glut = Math.round(tempFoodInfo.glut*100) + "%";
																
																for (int k = 0; k < tempFoodInfo.evs.length; k++) {
																	String evs = "";
																	String nm = tempFoodInfo.evs[k].ev.nm;
																	double a = tempFoodInfo.evs[k].a;
																	evs += (nm.toLowerCase().substring(0, 3)).replace("per", "prc").replace("cha", "csm") + " ";
																	evs += nm.substring(nm.length()-2, nm.length()) + " ";
																	evs += (double) Math.round(a*100.0)/100.0 ;
																	ALfep.add(evs);
																}
																det.add(ALfep);
															}
															if (str.getClass().getName().contains("Coinage")) {
																ArrayList<String> ALcoin = new ArrayList<String>();
																try {
																	Field coinNameField = str.getClass().getField("nm");
																	String coinFieldVal = "" + coinNameField.get(str);
																	ALcoin.add(coinFieldVal);
																}
																catch (Exception e){
																	gui.error("!! Coinage "+e+" !!");		
																}
																det.add(ALcoin);
															}

															
															if (str.getClass().getName().contains("Ingredient")) {
																try {
																	Field ingNameField = str.getClass().getField("name");
																	Field ingValField = str.getClass().getField("val");
																	String ingNameVal = "" + ingNameField.get(str);
																	Double ingValVal = (Double) ingValField.get(str);
																	DIngredients.add(ingNameVal + " ("+ Math.round(ingValVal*100) + "%)");
																}
																catch (Exception e){
																	gui.error("!! Ingredient: "+e+" !!");		
																}
															}

															if (str.getClass().getName().contains("Armpen")) {
																try {
																	ArrayList<String> ALArmpen = new ArrayList<String>();
																	ALArmpen.add("Armor penetration: ");
																	ALArmpen.add("" + (int)((Double)str.getClass().getField("deg").get(str)*100) + "%");
																	det.add(ALArmpen);
																}
																catch (Exception e){
																	gui.error("!! Armor penetration: "+e+" !!");		
																}
															}

															if (str.getClass().getName().contains("Weight")) {
																try {
																	ArrayList<String> ALWeight = new ArrayList<String>(2);
																	ALWeight.add("Weapon type: ");
																	ALWeight.add(""+((Resource)str.getClass().getField("attr").get(str)).basename());
																	det.add(ALWeight);
																}
																catch (Exception e){
																	gui.error("!! Weight: "+e+" !!");		
																}
															}

															if (str.getClass().getName().contains("Damage")) {
																try {
																	ArrayList<String> ALDamage = new ArrayList<String>(2);
																	ALDamage.add("Damage: ");
																	ALDamage.add(""+str.getClass().getField("dmg").get(str));
																	det.add(ALDamage);
																}
																catch (Exception e){
																	gui.error("!! Base damage: "+e+" !!");		
																}
															}

															if (str.getClass().getName().contains("Armor")) {
																try {
																	ArrayList<String> ALArmor = new ArrayList<String>(2);
																	ALArmor.add("Armor class: ");
																	ALArmor.add(""+str.getClass().getField("hard").get(str)+"/"+str.getClass().getField("soft").get(str));
																	det.add(ALArmor);
																}
																catch (Exception e){
																	gui.error("!! Armor class: "+e+" !!");		
																}
															}


															if (str.getClass().getName().contains("Curiosity")) {
																try {
																	ArrayList<String> ALCuriosity = new ArrayList<String>(4);
																	Double d_ct = 1.0 * (Double)str.getClass().getField("time").get(str);
																	Double d_exp = 1.0 * (int)str.getClass().getField("exp").get(str);
																	String s_ct = ((d_ct/60 < 10) ? "0" : "") + ((d_ct/60 < 1) ? "0" : "") + (int)(d_ct/60) + ":" + ((d_ct%60 < 10) ? "0" : "") + (int)(d_ct%60);
																	ALCuriosity.add("As curiosity: ");
																	ALCuriosity.add("Total LP: "+str.getClass().getField("exp").get(str));
																	ALCuriosity.add("M weight: "+str.getClass().getField("mw").get(str));
																	ALCuriosity.add("EXP cost: "+str.getClass().getField("enc").get(str));
																	ALCuriosity.add("" + (int)(d_exp/d_ct*60) + " LP/h (" + s_ct + ")");
																	det.add(ALCuriosity);
																}
																catch (Exception e){
																	gui.error("!! Curiosity: "+e+" !!");		
																}
															}
															
															if (str instanceof Wear) {
																ArrayList<String> ALWear = new ArrayList<String>();
																ALWear.add("Wear: ");
																Wear itemWear = (Wear) str;
																ALWear.add(itemWear.d + "/" + itemWear.m);
																det.add(ALWear);
															}
														}
													}
												}

												if (DAGBonuses.size() > 0) {
													ArrayList<String> ALga = new ArrayList<String>();
													ALga.add("As gilding: ");
													Set SetGildBonuses = DAGBonuses.entrySet();
													Iterator DGBi = SetGildBonuses.iterator();
													while (DGBi.hasNext()) {
														Map.Entry GildBonus = (Map.Entry) DGBi.next();
														ALga.add(GildBonus.getKey()+" "+((int)GildBonus.getValue() > 0 ? "+": "")+GildBonus.getValue());			
													}
													det.add(ALga);
												}

												if (DGildBonuses.size() > 0) {
													ArrayList<String> ALgb = new ArrayList<String>();
													ALgb.add("Gildings' bonuses: ");
													Set SetGildBonuses = DGildBonuses.entrySet();
													Iterator DGBi = SetGildBonuses.iterator();
													while (DGBi.hasNext()) {
														Map.Entry GildBonus = (Map.Entry) DGBi.next();
														ALgb.add(GildBonus.getKey()+" "+((int)GildBonus.getValue() > 0 ? "+": "")+GildBonus.getValue());			
													}
													det.add(ALgb);
												}

												if (DAttrBonuses.size() > 0) {
													ArrayList<String> ALattr = new ArrayList<String>();
													ALattr.add("Attribute mods: ");
													Set SetAttrBonuses = DAttrBonuses.entrySet();
													Iterator DABi = SetAttrBonuses.iterator();
													while (DABi.hasNext()) {
														Map.Entry AttrBonus = (Map.Entry) DABi.next();
														ALattr.add(AttrBonus.getKey()+" "+((int)AttrBonus.getValue() > 0 ? "+" : "")+AttrBonus.getValue());			
													}
													det.add(ALattr); 
												}

												if (DIngredients.size() > 0){
													ArrayList<String> ALing = new ArrayList<String>();
													ALing.add("Made of: ");
													for (int k1 = 0; k1 < DIngredients.size(); k1++){
														ALing.add(DIngredients.get(k1));
													}
													det.add(ALing);
												}

												String miscHTML = "";
												String pmiscHTML = "";
												String pname = "";
												String pq = "";
												String pnum = "";
												String pmisc = "";

												if (SB.price != null){
													pname += SB.price.name();  

													pnum += SB.pnum;
													if (SB.pq == 0) 
														pq = "Any";
													else 
														pq += (int) SB.pq;

													Object[] SB_pinfo = SB.price.info().toArray(); 
													for (int j = 0; j<SB_pinfo.length; j++) {
														if (SB_pinfo[j] instanceof ItemInfo) {
															ItemInfo str = (ItemInfo) SB_pinfo[j];
															if (str.getClass().getName().contains("Coinage")) {
																try {
																	Field coinNameField = str.getClass().getField("nm");
																	String coinFieldVal = "" + coinNameField.get(str);
																	pmisc += "" + coinFieldVal;
																	pmiscHTML += "<span>" + coinFieldVal + "</span>";
																}
																catch (Exception e){
																	gui.error("!! Price coinage: "+e+" !!");		
																}
															}
														}
													}
												} 

												try {
													for (int k1 = 0; k1<det.size(); k1++){
														for (int k2 = 0; k2 < det.get(k1).size(); k2++){
															misc += det.get(k1).get(k2);
													if (k2 != 0 && k2 < det.get(k1).size()-1) misc += ", ";  //line element separator
												}
												if (k1 < det.size()-1) misc += "  /  "; //line separator
											}
										}
										catch (Exception e){
											gui.error("\n \n !! Misc data build error: "+e+" !! \n \n ");		
										}

										try {
											for (int k1 = 0; k1<det.size(); k1++){
												for (int k2 = 0; k2 < det.get(k1).size(); k2++){
													if (det.get(k1).size() > 2) { //if list
														if (k2 == 0) miscHTML += "<h4>" + det.get(k1).get(k2) + "</h4>";  //pseudoheader of list
														else 	miscHTML += ((k2 == 1) ? "<ul>" : "") + "<li>" + det.get(k1).get(k2) + "</li>" +((k2 == det.get(k1).size()-1) ? "</ul>" : "");
													}
													else //if not list
													{
														miscHTML += ((k2 == 0) ? "<ul class=\"plain\"><h4>" : "") + "<li>" + det.get(k1).get(k2) + "</li>"+ ((k2 == 0) ? "</h4>" : "") + ((k2 == det.get(k1).size()-1) ? "</ul>" : "");
													}
												}
											}
											miscHTML = "<span>" + miscHTML + "</span>";
										}
										catch (Exception e){
											gui.error("\n \n !! HTML misc data build error: "+e+" !! \n \n ");		
										}


										String spt = "|";
										String sptHTML = "</td><td>";
										if ((name != "") && (pname != "")) {
											String strout = name + spt + misc + spt + q + spt + num + spt + pname + spt + pmisc + spt + pq + spt + pnum + spt + standX + spt + standY;
											ShopboxData.add("\n"+strout);
											String stroutHTML = "<tr><td>" + name + miscHTML + sptHTML + q + sptHTML + num + sptHTML + pname + pmiscHTML + sptHTML + pq + sptHTML + pnum + sptHTML + standX + sptHTML + standY + "</td></tr>";
											ShopboxDataHTML.add("\n"+stroutHTML);
										}
									}
									try {
										for (int SBDi = 0; SBDi < ShopboxData.size(); SBDi++){
											System.out.print(ShopboxData.get(SBDi));
										}
										System.out.print((read_time-System.currentTimeMillis()) + "\n");	 
									}
									catch (Exception e){
										gui.error("Data output error: " + e);
									}

									try {
										for (int SBDi = 0; SBDi < ShopboxDataHTML.size(); SBDi++){
											htmlOut(ShopboxDataHTML.get(SBDi));
										}
										htmlOut("\n");	
									}
									catch (Exception e){
										gui.error("HTML write error: " + e);
									}
									BSvisitedId.add(barterstandGob.id);

									
								}
								catch (Loading l) {
									gui.error("Barterstand read error: " + l);
								}
							}

							mc = new Coord2d (barterstandGob.rc.x + Math.cos(barterstandGob.a+0.4)*dist, barterstandGob.rc.y + Math.sin(barterstandGob.a+0.4)*dist);
							plrMoveTo(mc);
						}
					}
