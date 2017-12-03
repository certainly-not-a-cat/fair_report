package haven.automation;

import java.lang.reflect.*;
import java.util.*; 

import haven.*;
import haven.resutil.*;
import haven.res.ui.tt.*;
import haven.res.ui.barterbox.* ;
import haven.res.ui.tt.q.qbuff.*;
//import haven.factories.*;
//import haven.res.ui.tt.ArmorFactory;
//import haven.res.ui.tt.WearFactory;
//import haven.res.ui.tt.defn.DefName;
import static haven.OCache.posres;

public class Plus implements Runnable {
	private GameUI gui;
	public static double BeaconX = 0;
	public static double BeaconY = 0;
	public static ArrayList<Long> BSvisitedId = new ArrayList<Long>();
	public double standX = 0;
	public double standY = 0;
		
	public Plus(GameUI gui) {
		this.gui = gui;
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

		Double dist = 12.0;
		Gob pl = gui.map.player();
		Coord2d mc = new Coord2d (barterstandGob.rc.x + Math.cos(barterstandGob.a)*dist, barterstandGob.rc.y + Math.sin(barterstandGob.a)*dist);
		if (Config.pf) {
			gui.map.pfLeftClick(mc.floor(), null);
			try {
				gui.map.pfthread.join();
			} catch (InterruptedException e) {
				return;
			}
		} else {
			gui.map.wdgmsg("click", pl.sc, mc.floor(posres), 1, 0);
		}		
		Long now = System.currentTimeMillis();
		while (System.currentTimeMillis() - now < 20000 && pl.getattr(Moving.class) != null){
			try {
				Thread.sleep(100);
			}
			catch(InterruptedException e) { Thread.currentThread().interrupt(); }
		}

		gui.map.wdgmsg("click", barterstandGob.sc, barterstandGob.rc.floor(posres), 3, 0, 0, (int) barterstandGob.id, barterstandGob.rc.floor(posres), 0, -1);
		if ((BeaconX == 0) || (BeaconY == 0))
		{
			BeaconX = barterstandGob.rc.x;
			BeaconY = barterstandGob.rc.y;
		}
		standX = barterstandGob.rc.x - BeaconX;
		standY = barterstandGob.rc.y - BeaconY;
		
		now = System.currentTimeMillis();
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
									java.lang.System.out.print("\n\n"+e+"\n\n");
								}
							}
							Thread.sleep(200);
						}
						catch (InterruptedException e) { Thread.currentThread().interrupt(); }
					}

					if (emptyBoxes >= 5)
						BSvisitedId.add(barterstandGob.id);
					else
						if ((probeSB != null) && (loaded != false)) {
						java.lang.System.out.print("\n");
						try {
							for (Widget w = gui.lchild; w != null; w = w.prev) 
								if (w instanceof Window)
									for (Widget sw = w.lchild; sw != null; sw = sw.prev) 
										if (sw instanceof Shopbox) {
											SB = (Shopbox) sw;

											String strout = "";
											String num = "";
											String q = "";
											String name = "";
											String misc = "";

											ArrayList<ArrayList<String>> det = new ArrayList<ArrayList<String>>();

											if ((SB.num != null)) {
												num = SB.num.text.split(" ")[0];
											}
											if (SB.info() != null) {
												Object[] SB_info = SB.info().toArray(); 
												for (int j = 0; j<SB_info.length; j++) {
													if (SB_info[j] instanceof ItemInfo) {
														ItemInfo str = (ItemInfo) SB_info[j];
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
															ALcontent.add(tempBuffer);
															ALcontent.add(" Q"+q);
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
																		/*ISlots.s.info contains no gldings'q, retrieve attr. mods instead*/
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
																java.lang.System.out.print("!! "+e+" !!");		
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
																evs += nm.toLowerCase().substring(0, 3) + " ";
																evs += nm.substring(nm.length()-2, nm.length()) + ": ";
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
																java.lang.System.out.print("!! "+e+" !!");		
															}
															det.add(ALcoin);
														}

														
														if (str.getClass().getName().contains("Ingredient")) {
														ArrayList<String> ALing = new ArrayList<String>();
														ALing.add("");
															try {
																Field ingNameField = str.getClass().getField("name");
																Field ingValField = str.getClass().getField("val");
																String ingNameVal = "" + ingNameField.get(str);
																Double ingValVal = (Double) ingValField.get(str);
																ALing.add(ingNameVal + " ("+ Math.round(ingValVal*100) + "%)");
															}
															det.add(ALing);
															catch (Exception e){
																java.lang.System.out.print("!! "+e+" !!");		
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
											java.lang.System.out.print("\n \n !! Misc data build error: "+e+" !! \n \n ");		
										}


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
																pmisc += " " + coinFieldVal;
															}
															catch (Exception e){
																java.lang.System.out.print("!! "+e+" !!");		
															}
														}
													}
												}
											} 

											String spt = "|";
											if ((name != "") && (pname != "")) {
												strout += name + spt + misc + spt + q + spt + num + spt + pname + spt + pmisc + spt + pq + spt + pnum + spt + standX + spt + standY;
												gui.msg(strout, java.awt.Color.white);
												java.lang.System.out.print(strout+"\n");
											}
										}
									BSvisitedId.add(barterstandGob.id);

									}
									catch (Loading l) {
										java.lang.System.out.print("Shopbox read error: " + l);
									}
								}

								dist = 16.0;
								pl = gui.map.player();
								mc = new Coord2d (barterstandGob.rc.x + Math.cos(barterstandGob.a)*dist, barterstandGob.rc.y + Math.sin(barterstandGob.a)*dist);

								if (Config.pf) {
									gui.map.pfLeftClick(mc.floor(), null);
									try {
										gui.map.pfthread.join();
									} catch (InterruptedException e) {
										return;
									}
								} else {
									gui.map.wdgmsg("click", pl.sc, mc.floor(posres), 1, 0);
								}

							}
						}

/* OBJECT BUTCHER 
												java.lang.System.out.print(str.getClass().getName());
												Field [] coinFields = str.getClass().getFields();
												for (int k = 0; k < coinFields.length; k++) {
													String coinFieldName = "" + coinFields[k].getName();
													String coinFieldVal = "" + coinFields[k].get(str);
													java.lang.System.out.print("\n"+coinFieldName+": "+coinFieldVal);													
													}
													java.lang.System.out.print("\n");
													/* OBJECT BUTCHER END */

//TODO: gear stats summary