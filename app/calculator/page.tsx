"use client";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

type CalcType = "masonry"|"plaster"|"concrete"|"flooring"|"paint"|"sand"|"staircase"|"openings"|"footing"|"waterproofing"|"estimate"|"slab"|"beam"|"septictank"|"watertank";
type LenUnit = "m"|"mm"|"ft";
type AreaUnit = "sqm"|"sqft";

const toM  = (v: number, u: LenUnit)  => u==="mm" ? v/1000 : u==="ft" ? v*0.3048 : v;
const toM2 = (v: number, u: AreaUnit) => u==="sqft" ? v*0.0929 : v;
const fmtAll = (m: number) => `${m.toFixed(3)} m  |  ${(m*1000).toFixed(0)} mm  |  ${(m/0.3048).toFixed(2)} ft`;

// ── ALL UI COMPONENTS OUTSIDE MAIN COMPONENT ─────────────────
const inputCls = "w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white";

function RC({ label, value, unit }: { label:string; value:string|number; unit?:string }) {
  return (
    <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-center">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-teal-700">{value}</p>
      {unit && <p className="text-xs text-gray-400">{unit}</p>}
    </div>
  );
}

function Sel({ label, value, onChange, children }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select value={value} onChange={(e)=>onChange(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">{children}</select>
    </div>
  );
}

function Btn({ onClick }: { onClick:()=>void }) {
  return (
    <button onClick={onClick} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition mb-6">Calculate →</button>
  );
}

function MR({ value, onChange }: any) {
  return (
    <Sel label="Mortar / Mix Ratio" value={value} onChange={onChange}>
      <option value="1:6">1:6 — Basic / Internal Walls</option>
      <option value="1:4">1:4 — Standard External Wall</option>
      <option value="1:3">1:3 — Strong / Waterproof</option>
      <option value="1:2">1:2 — High End / Water Tank</option>
      <option value="1:1">1:1 — Extreme / Swimming Pool</option>
    </Sel>
  );
}

function NI({ label, value, onChange, placeholder, lenUnit }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} <span className="text-blue-600 font-bold">({lenUnit})</span>
      </label>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        placeholder={placeholder||"e.g. 3"}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        className={inputCls}
      />
    </div>
  );
}

function AI({ label, value, onChange, areaUnit }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} <span className="text-blue-600 font-bold">({areaUnit==="sqm"?"sq.m":"sq.ft"})</span>
      </label>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        placeholder="e.g. 50"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        className={inputCls}
      />
    </div>
  );
}

function TI({ label, value, onChange, placeholder }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        placeholder={placeholder||"e.g. 1"}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        className={inputCls}
      />
    </div>
  );
}

function DimInfo({ info }: { info:string }) {
  return <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 text-xs text-blue-700 font-mono">{info}</div>;
}

// ── MAIN COMPONENT ────────────────────────────────────────────
export default function CalculatorPage() {
  const [activeCalc, setActiveCalc] = useState<CalcType>("masonry");
  const [lenUnit,  setLenUnit]  = useState<LenUnit>("m");
  const [areaUnit, setAreaUnit] = useState<AreaUnit>("sqm");

  const [masonryType, setMasonryType] = useState("clay_4_5inch");
  const [mortarRatio, setMortarRatio] = useState("1:6");
  const [wLen, setWLen] = useState(""); const [wHgt, setWHgt] = useState("");
  const [masonryResult, setMasonryResult] = useState<any>(null);

  const [plasterArea,  setPlasterArea]  = useState("");
  const [plasterThk,   setPlasterThk]   = useState("12");
  const [plasterRatio, setPlasterRatio] = useState("1:4");
  const [plasterResult, setPlasterResult] = useState<any>(null);

  const [cLen, setCLen] = useState(""); const [cWid, setCWid] = useState(""); const [cDep, setCDep] = useState("");
  const [concreteGrade, setConcreteGrade] = useState("M20");
  const [concreteResult, setConcreteResult] = useState<any>(null);

  const [fLen, setFLen] = useState(""); const [fWid, setFWid] = useState("");
  const [tileLen, setTileLen] = useState("600"); const [tileWid, setTileWid] = useState("600");
  const [floorResult, setFloorResult] = useState<any>(null);

  const [paintArea, setPaintArea] = useState(""); const [paintCoats, setPaintCoats] = useState("2");
  const [paintResult, setPaintResult] = useState<any>(null);

  const [sLen, setSLen] = useState(""); const [sWid, setSWid] = useState(""); const [sDep, setSDep] = useState("");
  const [sandResult, setSandResult] = useState<any>(null);

  const [stairFH, setStairFH] = useState(""); const [stairW, setStairW] = useState("");
  const [stairRiser, setStairRiser] = useState("150");
  const [stairTread, setStairTread] = useState("270");
  const [stairThk,   setStairThk]   = useState("150");
  const [stairResult,   setStairResult]   = useState<any>(null);
  const [stairWarnings, setStairWarnings] = useState<string[]>([]);

  const [oWLen, setOWLen] = useState(""); const [oWHgt, setOWHgt] = useState("");
  const [numDoors, setNumDoors]     = useState("1"); const [doorW, setDoorW] = useState("0.9"); const [doorH, setDoorH] = useState("2.1");
  const [numWindows, setNumWindows] = useState("1"); const [winW, setWinW]   = useState("1.2"); const [winH, setWinH]   = useState("1.2");
  const [openingsResult, setOpeningsResult] = useState<any>(null);

  const [ftLen, setFtLen] = useState(""); const [ftWid, setFtWid] = useState(""); const [ftDep, setFtDep] = useState("");
  const [pccThk, setPccThk] = useState("0.1"); const [footingGrade, setFootingGrade] = useState("M20");
  const [footingResult, setFootingResult] = useState<any>(null);

  const [wpArea, setWpArea] = useState(""); const [wpType, setWpType] = useState("drfixit");
  const [wpResult, setWpResult] = useState<any>(null);

  const [estPLen, setEstPLen] = useState(""); const [estPWid, setEstPWid] = useState("");
  const [estFloors, setEstFloors] = useState("1"); const [estFloorHeight, setEstFloorHeight] = useState("3");
  const [estResult, setEstResult] = useState<any>(null);

  const [slabLen, setSlabLen] = useState(""); const [slabWid, setSlabWid] = useState("");
  const [slabThk, setSlabThk] = useState("150"); const [slabGrade, setSlabGrade] = useState("M20");
  const [slabResult, setSlabResult] = useState<any>(null);

  const [beamType,  setBeamType]  = useState("beam");
  const [beamLen,   setBeamLen]   = useState(""); const [beamWid, setBeamWid] = useState(""); const [beamDep, setBeamDep] = useState("");
  const [beamGrade, setBeamGrade] = useState("M20"); const [beamCount, setBeamCount] = useState("1");
  const [beamResult, setBeamResult] = useState<any>(null);

  const [septicUsers, setSepticUsers] = useState(""); const [septicType, setSepticType] = useState("residential");
  const [septicResult, setSepticResult] = useState<any>(null);

  const [tankUsers, setTankUsers] = useState(""); const [tankDays, setTankDays] = useState("1");
  const [tankShape, setTankShape] = useState("rectangular");
  const [tankLen, setTankLen] = useState(""); const [tankWid, setTankWid] = useState("");
  const [tankHgt, setTankHgt] = useState(""); const [tankDia, setTankDia] = useState("");
  const [tankResult, setTankResult] = useState<any>(null);

  const masonryTypes: any = {
    clay_4_5inch:    { name:"Clay Brick – 4.5\" Wall (Half Brick)",       L:0.190,H:0.090,T:0.115, label:"Bricks", isAAC:false,isIL:false, note:"Partition walls" },
    clay_9inch:      { name:"Clay Brick – 9\" Wall (Full Brick)",          L:0.190,H:0.090,T:0.230, label:"Bricks", isAAC:false,isIL:false, note:"External / load bearing walls" },
    clay_13_5inch:   { name:"Clay Brick – 13.5\" Wall (1.5 Brick)",       L:0.190,H:0.090,T:0.345, label:"Bricks", isAAC:false,isIL:false, note:"Boundary / retaining walls" },
    interlock_290:   { name:"Interlocking Brick 290×140×90mm",            L:0.290,H:0.090,T:0.140, label:"Bricks", isAAC:false,isIL:true,  note:"No mortar between courses – bedding mortar at base only" },
    interlock_230:   { name:"Interlocking Brick 230×110×75mm (Small)",    L:0.230,H:0.075,T:0.110, label:"Bricks", isAAC:false,isIL:true,  note:"Small interlocking brick" },
    interlock_300:   { name:"Interlocking Brick 300×150×100mm (Large)",   L:0.300,H:0.100,T:0.150, label:"Bricks", isAAC:false,isIL:true,  note:"Large interlocking brick – fast construction" },
    interlock_400:   { name:"Interlocking Brick 400×200×100mm (Block)",   L:0.400,H:0.200,T:0.100, label:"Bricks", isAAC:false,isIL:true,  note:"Block size – very fast construction" },
    block_4inch:     { name:"Concrete Block 4\" (400×200×100mm)",         L:0.400,H:0.200,T:0.100, label:"Blocks", isAAC:false,isIL:false, note:"Partition walls" },
    block_6inch:     { name:"Concrete Block 6\" (400×200×150mm)",         L:0.400,H:0.200,T:0.150, label:"Blocks", isAAC:false,isIL:false, note:"Load bearing walls" },
    block_8inch:     { name:"Concrete Block 8\" (400×200×200mm)",         L:0.400,H:0.200,T:0.200, label:"Blocks", isAAC:false,isIL:false, note:"Heavy external / retaining walls" },
    aac_4inch:       { name:"AAC Block 4\" (600×200×100mm)",              L:0.600,H:0.200,T:0.100, label:"Blocks", isAAC:true, isIL:false, note:"Lightweight – partition walls" },
    aac_6inch:       { name:"AAC Block 6\" (600×200×150mm)",              L:0.600,H:0.200,T:0.150, label:"Blocks", isAAC:true, isIL:false, note:"Lightweight – external walls" },
    aac_8inch:       { name:"AAC Block 8\" (600×200×200mm)",              L:0.600,H:0.200,T:0.200, label:"Blocks", isAAC:true, isIL:false, note:"Lightweight – heavy external walls" },
    porotherm_4inch: { name:"Porotherm Block 4\" (400×200×100mm)",        L:0.400,H:0.200,T:0.100, label:"Blocks", isAAC:false,isIL:false, note:"Clay hollow block – partition walls" },
    porotherm_6inch: { name:"Porotherm Block 6\" (400×200×150mm)",        L:0.400,H:0.200,T:0.150, label:"Blocks", isAAC:false,isIL:false, note:"Clay hollow block – external walls" },
    porotherm_8inch: { name:"Porotherm Block 8\" (400×200×200mm)",        L:0.400,H:0.200,T:0.200, label:"Blocks", isAAC:false,isIL:false, note:"Clay hollow block – heavy external walls" },
  };

  const mortarRatios: any = { "1:6":[1,6],"1:4":[1,4],"1:3":[1,3],"1:2":[1,2],"1:1":[1,1] };

  const concreteGrades: any = {
    "M10":{ ratio:[1,3,6],     use:"Plain Concrete / PCC"     },
    "M15":{ ratio:[1,2,4],     use:"Foundation / PCC"         },
    "M20":{ ratio:[1,1.5,3],   use:"RCC Slab / Beam / Column" },
    "M25":{ ratio:[1,1,2],     use:"Heavy RCC Structure"      },
    "M30":{ ratio:[1,0.75,1.5],use:"Bridges / Industrial"     },
    "M35":{ ratio:[1,0.6,1.2], use:"High Rise Buildings"      },
    "M40":{ ratio:[1,0.5,1.0], use:"Precast / Prestressed"    },
    "M45":{ ratio:[1,0.4,0.8], use:"Bridges / Dams / Special" },
  };

  const L = (v: string) => toM(+v, lenUnit);
  const A = (v: string) => toM2(+v, areaUnit);

  const concreteCalc = (vol: number, grade: string) => {
    const dryVol=vol*1.54;
    const [c,s,a]=concreteGrades[grade]?.ratio||[1,1.5,3];
    const tot=c+s+a, cement=(dryVol*c)/tot, sand=(dryVol*s)/tot, agg=(dryVol*a)/tot;
    return { cementBags:Math.ceil(cement/0.0347), sandM3:+sand.toFixed(3), sandCFT:+(sand*35.3147).toFixed(2), aggM3:+agg.toFixed(3), aggCFT:+(agg*35.3147).toFixed(2), water:Math.ceil(Math.ceil(cement/0.0347)*25) };
  };

  const mortarCalc = (vol: number, ratio: string) => {
    const dryVol=vol*1.3; const [c,s]=mortarRatios[ratio]||[1,6];
    const cement=(dryVol*c)/(c+s), sand=(dryVol*s)/(c+s);
    return { cementBags:Math.ceil(cement/0.0347), sandM3:+sand.toFixed(3), sandCFT:+(sand*35.3147).toFixed(2) };
  };

  const calculateMasonry = () => {
    const l=L(wLen), h=L(wHgt); if (!l||!h) return;
    const type=masonryTypes[masonryType];
    const wallVol=l*h*type.T, wallArea=l*h, unitVol=type.L*type.H*type.T;
    let units=0,cementBags=0,sandM3=0,sandCFT=0,aacBags=0;
    if (type.isIL) { units=Math.ceil((wallArea/(type.L*type.H))*1.05); const m=mortarCalc(l*type.T*0.02,"1:4"); cementBags=m.cementBags; sandM3=m.sandM3; sandCFT=m.sandCFT; }
    else if (type.isAAC) { units=Math.ceil((wallArea/(type.L*type.H))*1.03); aacBags=Math.ceil(units/100); }
    else { units=Math.ceil((wallVol/unitVol)*0.70*1.05); const m=mortarCalc(wallVol*0.30,mortarRatio); cementBags=m.cementBags; sandM3=m.sandM3; sandCFT=m.sandCFT; }
    setMasonryResult({ wallArea:wallArea.toFixed(2), units, label:type.label, isAAC:type.isAAC, isIL:type.isIL, cementBags, sandM3, sandCFT, aacBags, typeName:type.name, dimInfo:`L: ${fmtAll(l)}  |  H: ${fmtAll(h)}` });
  };
  const calculatePlaster = () => {
    const area=A(plasterArea), t=+plasterThk/1000; if (!area) return;
    const m=mortarCalc(area*t,plasterRatio);
    setPlasterResult({ area:area.toFixed(2), cementBags:m.cementBags, sand:m.sandM3, sandCFT:m.sandCFT });
  };
  const calculateConcrete = () => {
    const l=L(cLen), w=L(cWid), d=L(cDep); if (!l||!w||!d) return;
    const vol=l*w*d;
    setConcreteResult({ volume:vol.toFixed(3), ...concreteCalc(vol,concreteGrade), dimInfo:`${fmtAll(l)} × ${fmtAll(w)} × ${fmtAll(d)}` });
  };
  const calculateFlooring = () => {
    const fl=L(fLen), fw=L(fWid), tl=+tileLen/1000, tw=+tileWid/1000; if (!fl||!fw) return;
    const floorArea=fl*fw, tileArea=tl*tw, tilesNeeded=Math.ceil((floorArea/tileArea)*1.10);
    setFloorResult({ floorArea:floorArea.toFixed(2), tilesNeeded, boxes:Math.ceil(tilesNeeded/4), wastage:Math.ceil(tilesNeeded*0.10), dimInfo:`${fmtAll(fl)} × ${fmtAll(fw)}` });
  };
  const calculatePaint = () => {
    const area=A(paintArea), coats=+paintCoats; if (!area) return;
    const totalArea=area*coats, paintLitres=Math.ceil(totalArea/9);
    setPaintResult({ totalArea:totalArea.toFixed(2), primerLitres:Math.ceil(area/10), paintLitres, paintBuckets4L:Math.ceil(paintLitres/4), paintBuckets20L:Math.ceil(paintLitres/20) });
  };
  const calculateSand = () => {
    const l=L(sLen), w=L(sWid), d=L(sDep); if (!l||!w||!d) return;
    const vol=l*w*d, volCFT=vol*35.3147;
    setSandResult({ volume:vol.toFixed(3), volumeCFT:volCFT.toFixed(2), weightTons:(vol*1.6).toFixed(2), lorryLoads:Math.ceil(volCFT/100), dimInfo:`${fmtAll(l)} × ${fmtAll(w)} × ${fmtAll(d)}` });
  };
  const calculateStaircase = () => {
    const fhM=L(stairFH), wM=L(stairW), riserMm=+stairRiser, treadMm=+stairTread, thkMm=+stairThk;
    if (!fhM||!wM) return;
    const riserM=riserMm/1000, treadM=treadMm/1000, thkM=thkMm/1000;
    const steps=Math.ceil(fhM/riserM), actualRiserM=fhM/steps, actualRiserMm=actualRiserM*1000, runM=steps*treadM;
    const vol=(runM*wM*thkM)+(steps*0.5*actualRiserM*treadM*wM);
    const conc=concreteCalc(vol,"M20"), tileArea=(runM*wM)+(steps*actualRiserM*wM);
    const warns:string[]=[];
    if (actualRiserMm>175) warns.push(`⚠️ Riser ${actualRiserMm.toFixed(1)}mm exceeds IS code max 175mm`);
    if (treadMm<250) warns.push(`⚠️ Tread ${treadMm}mm below IS code min 250mm`);
    if (fhM/riserM%1!==0) warns.push(`ℹ️ Riser adjusted to ${actualRiserMm.toFixed(1)}mm to fit ${steps} steps exactly`);
    setStairWarnings(warns);
    setStairResult({ steps, fhM:fhM.toFixed(3), fhMm:(fhM*1000).toFixed(0), fhFt:(fhM/0.3048).toFixed(2), wM:wM.toFixed(3), riserMm:actualRiserMm.toFixed(1), treadMm, runM:runM.toFixed(3), vol:vol.toFixed(3), tileArea:tileArea.toFixed(2), tilesNeeded:Math.ceil(tileArea*1.10/(0.6*0.6)), ...conc });
  };
  const calculateOpenings = () => {
    const wl=L(oWLen), wh=L(oWHgt); if (!wl||!wh) return;
    const gross=wl*wh, dA=+numDoors*+doorW*+doorH, wA=+numWindows*+winW*+winH, net=gross-dA-wA;
    setOpeningsResult({ gross:gross.toFixed(2), dA:dA.toFixed(2), wA:wA.toFixed(2), net:net.toFixed(2), deduction:((dA+wA)/gross*100).toFixed(1), bricksSaved:Math.ceil((dA+wA)*0.23/(0.19*0.09*0.09)*0.7) });
  };
  const calculateFooting = () => {
    const l=L(ftLen), w=L(ftWid), d=L(ftDep), pcc=+pccThk; if (!l||!w||!d) return;
    const pccMat=concreteCalc(l*w*pcc,"M10"), footMat=concreteCalc(l*w*d,footingGrade);
    setFootingResult({ excavVol:(l*w*(d+pcc)).toFixed(3), excavCFT:(l*w*(d+pcc)*35.3147).toFixed(2), pccVol:(l*w*pcc).toFixed(3), pccCement:pccMat.cementBags, pccSand:pccMat.sandCFT, pccAgg:pccMat.aggCFT, footVol:(l*w*d).toFixed(3), footCement:footMat.cementBags, footSand:footMat.sandCFT, footAgg:footMat.aggCFT, dimInfo:`${fmtAll(l)} × ${fmtAll(w)} × ${fmtAll(d)}` });
  };
  const calculateWaterproofing = () => {
    const area=A(wpArea); if (!area) return;
    const cov:any={ drfixit:{name:"Dr. Fixit Roofseal",rate:1.5,extra:"Apply primer coat separately"}, crystalline:{name:"Crystalline Waterproofing",rate:0.8,extra:"Mix with cement slurry"}, membrane:{name:"APP/SBS Membrane",rate:1.0,extra:"10 sq.m per roll (1m×10m)"}, pidilite:{name:"Pidilite Dr. Fixit LW+",rate:1.2,extra:"2 coats recommended"} };
    const wp=cov[wpType], qty=area*wp.rate;
    setWpResult({ area:area.toFixed(2), name:wp.name, qty:qty.toFixed(1), extra:wp.extra, rolls:wpType==="membrane"?Math.ceil(area/10):null, bags5:Math.ceil(qty/5), bags20:Math.ceil(qty/20) });
  };
  const calculateEstimate = () => {
    const pl=L(estPLen), pw=L(estPWid), floors=+estFloors, fh=+estFloorHeight; if (!pl||!pw) return;
    const bua=pl*pw*0.6, total=bua*floors, wallArea=2*(pl+pw)*fh*floors*1.5*0.80;
    const slabC=concreteCalc(total*0.15,"M20").cementBags, wm=mortarCalc(wallArea*0.23*0.30,"1:6"), pm=mortarCalc(wallArea*2*0.012,"1:4");
    const totalC=slabC+wm.cementBags+pm.cementBags, totalS=+(wm.sandM3+pm.sandM3+total*0.10).toFixed(1), aggM3=+(total*0.25).toFixed(1);
    const bricks=Math.ceil(wallArea*0.23/(0.19*0.09*0.09)*0.7*1.05), tiles=Math.ceil(total*1.1/(0.6*0.6)), paintL=Math.ceil(wallArea*2*2/9);
    setEstResult({ bua:bua.toFixed(0), total:total.toFixed(0), bricks, totalC, totalS, totalSCFT:+(totalS*35.3147).toFixed(0), aggM3, aggCFT:+(aggM3*35.3147).toFixed(0), tiles, paintL, paintB20:Math.ceil(paintL/20) });
  };
  const calculateSlab = () => {
    const l=L(slabLen), w=L(slabWid), t=+slabThk/1000; if (!l||!w) return;
    const vol=l*w*t;
    setSlabResult({ area:(l*w).toFixed(2), vol:vol.toFixed(3), ...concreteCalc(vol,slabGrade), dimInfo:`${fmtAll(l)} × ${fmtAll(w)} × ${slabThk}mm` });
  };
  const calculateBeam = () => {
    const l=L(beamLen), w=L(beamWid), d=L(beamDep), count=+beamCount; if (!l||!w||!d) return;
    const vol=l*w*d*count;
    setBeamResult({ singleVol:(l*w*d).toFixed(3), totalVol:vol.toFixed(3), count, ...concreteCalc(vol,beamGrade), dimInfo:`${fmtAll(l)} × ${fmtAll(w)} × ${fmtAll(d)}` });
  };
  const calculateSepticTank = () => {
    const users=+septicUsers; if (!users) return;
    const lpd=septicType==="residential"?135:septicType==="commercial"?45:20;
    const dailyFlow=users*lpd/1000, liquidCap=dailyFlow*1.5*24, sludgeCap=users*0.03*3, totalVol=liquidCap+sludgeCap;
    const depth=1.5, width=Math.ceil(Math.sqrt(totalVol/depth)*10)/10, length=Math.ceil((totalVol/(width*depth))*10)/10;
    const conc=concreteCalc(2*(length*width+length*depth+width*depth)*0.15,"M20");
    setSepticResult({ users, lpd, dailyFlow:dailyFlow.toFixed(3), liquidCap:liquidCap.toFixed(3), sludgeCap:sludgeCap.toFixed(3), totalVol:totalVol.toFixed(3), length:length.toFixed(2), width:width.toFixed(2), depth:depth.toFixed(2), cementBags:conc.cementBags, sandCFT:conc.sandCFT, aggCFT:conc.aggCFT });
  };
  const calculateWaterTank = () => {
    const users=+tankUsers; if (!users) return;
    const totalLitres=users*135*+tankDays, totalM3=totalLitres/1000;
    let cap=0;
    if (tankShape==="rectangular") { const l=L(tankLen), w=L(tankWid), h=L(tankHgt); cap=l*w*h*1000; }
    else { const d=L(tankDia), h=L(tankHgt); cap=Math.PI*(d/2)*(d/2)*h*1000; }
    setTankResult({ users, days:+tankDays, totalLitres, totalM3:totalM3.toFixed(3), cap:cap>0?cap.toFixed(0):null, sufficient:cap>=totalLitres });
  };

  const calculators = [
    { id:"masonry",       label:"🧱 Masonry",     desc:"Bricks & Blocks"  },
    { id:"plaster",       label:"🪣 Plastering",   desc:"Cement + Sand"    },
    { id:"concrete",      label:"⬜ Concrete",     desc:"M10 to M45"       },
    { id:"slab",          label:"🏠 Slab",         desc:"RCC Slab"         },
    { id:"beam",          label:"🏛️ Beam/Column",  desc:"Structural"       },
    { id:"flooring",      label:"🟫 Flooring",     desc:"Tiles + Boxes"    },
    { id:"paint",         label:"🎨 Paint",        desc:"Litres + Buckets" },
    { id:"sand",          label:"🏖️ Sand/Fill",    desc:"Volume + Weight"  },
    { id:"staircase",     label:"🪜 Staircase",    desc:"Auto Steps"       },
    { id:"openings",      label:"🪟 Openings",     desc:"Door & Window"    },
    { id:"footing",       label:"🏗️ Footing",      desc:"Foundation"       },
    { id:"waterproofing", label:"🌧️ Waterproof",   desc:"Chemical Qty"     },
    { id:"septictank",    label:"🚽 Septic Tank",   desc:"IS 2470"          },
    { id:"watertank",     label:"💧 Water Tank",    desc:"Capacity Check"   },
    { id:"estimate",      label:"🧰 Estimate",     desc:"Full House"       },
  ];

  return (
    <>
      <Navbar />
      <main className="bg-slate-50 min-h-screen">
        <section className="bg-gradient-to-br from-blue-700 to-blue-500 text-white py-10 px-8 text-center">
          <h1 className="text-3xl font-bold mb-2">🧱 Building Materials Calculator</h1>
          <p className="text-blue-100">15 Calculators · IS Code Based · Results in m, mm, ft & CFT</p>
        </section>

        <section className="max-w-5xl mx-auto px-6 py-8">

          {/* ── GLOBAL UNIT SELECTOR ── */}
          <div className="bg-white border-2 border-blue-200 rounded-2xl p-5 mb-8 shadow-sm">
            <p className="text-sm font-bold text-gray-700 mb-4">⚙️ Select Your Units — applies to all fields in all calculators</p>
            <div className="flex flex-wrap gap-8">
              <div>
                <p className="text-xs text-gray-500 mb-2 font-medium">📏 Length / Width / Height / Depth</p>
                <div className="flex gap-2">
                  {(["m","mm","ft"] as LenUnit[]).map(u=>(
                    <button key={u} onClick={()=>setLenUnit(u)}
                      className={`px-6 py-2.5 rounded-xl font-bold text-sm border-2 transition ${lenUnit===u?"bg-blue-600 border-blue-600 text-white shadow-md":"bg-white border-gray-300 text-gray-600 hover:border-blue-400"}`}>
                      {u}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2 font-medium">📐 Area (Paint · Plaster · Waterproofing)</p>
                <div className="flex gap-2">
                  {(["sqm","sqft"] as AreaUnit[]).map(u=>(
                    <button key={u} onClick={()=>setAreaUnit(u)}
                      className={`px-6 py-2.5 rounded-xl font-bold text-sm border-2 transition ${areaUnit===u?"bg-blue-600 border-blue-600 text-white shadow-md":"bg-white border-gray-300 text-gray-600 hover:border-blue-400"}`}>
                      {u==="sqm"?"sq.m":"sq.ft"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">💡 Change units anytime — just click another button above and recalculate</p>
          </div>

          {/* ── TABS ── */}
          <div className="grid grid-cols-4 md:grid-cols-5 gap-2 mb-8">
            {calculators.map((c)=>(
              <button key={c.id} onClick={()=>setActiveCalc(c.id as CalcType)}
                className={`p-3 rounded-xl text-center transition border-2 ${activeCalc===c.id?"bg-blue-600 border-blue-600 text-white shadow-lg":"bg-white border-gray-200 text-gray-600 hover:border-blue-400"}`}>
                <p className="text-lg">{c.label.split(" ")[0]}</p>
                <p className="text-xs font-semibold mt-1 leading-tight">{c.label.split(" ").slice(1).join(" ")}</p>
                <p className="text-xs opacity-70">{c.desc}</p>
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

            {/* ── MASONRY ── */}
            {activeCalc==="masonry" && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">🧱 Masonry Calculator</h2>
                <p className="text-gray-500 text-sm mb-6">Clay Bricks · Interlocking · Concrete Blocks · AAC · Porotherm</p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="col-span-2">
                    <Sel label="Masonry Type" value={masonryType} onChange={setMasonryType}>
                      <optgroup label="🧱 Clay Bricks">
                        <option value="clay_4_5inch">Clay Brick – 4.5" Wall (Half Brick / Partition)</option>
                        <option value="clay_9inch">Clay Brick – 9" Wall (Full Brick / Load Bearing)</option>
                        <option value="clay_13_5inch">Clay Brick – 13.5" Wall (Boundary / Retaining)</option>
                      </optgroup>
                      <optgroup label="🔗 Interlocking Clay Bricks">
                        <option value="interlock_290">Interlocking Brick 290×140×90mm</option>
                        <option value="interlock_230">Interlocking Brick 230×110×75mm (Small)</option>
                        <option value="interlock_300">Interlocking Brick 300×150×100mm (Large)</option>
                        <option value="interlock_400">Interlocking Brick 400×200×100mm (Block Size)</option>
                      </optgroup>
                      <optgroup label="⬜ Concrete Blocks">
                        <option value="block_4inch">Concrete Block 4" (400×200×100mm)</option>
                        <option value="block_6inch">Concrete Block 6" (400×200×150mm)</option>
                        <option value="block_8inch">Concrete Block 8" (400×200×200mm)</option>
                      </optgroup>
                      <optgroup label="🟦 AAC Blocks">
                        <option value="aac_4inch">AAC Block 4" (600×200×100mm)</option>
                        <option value="aac_6inch">AAC Block 6" (600×200×150mm)</option>
                        <option value="aac_8inch">AAC Block 8" (600×200×200mm)</option>
                      </optgroup>
                      <optgroup label="🟧 Porotherm Blocks">
                        <option value="porotherm_4inch">Porotherm 4" (400×200×100mm)</option>
                        <option value="porotherm_6inch">Porotherm 6" (400×200×150mm)</option>
                        <option value="porotherm_8inch">Porotherm 8" (400×200×200mm)</option>
                      </optgroup>
                    </Sel>
                  </div>
                  {masonryTypes[masonryType]?.note && (
                    <div className="col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">ℹ️ {masonryTypes[masonryType].note}</div>
                  )}
                  <NI label="Wall Length" value={wLen} onChange={setWLen} lenUnit={lenUnit} />
                  <NI label="Wall Height" value={wHgt} onChange={setWHgt} lenUnit={lenUnit} />
                  {!masonryTypes[masonryType]?.isAAC && !masonryTypes[masonryType]?.isIL && (
                    <div className="col-span-2"><MR value={mortarRatio} onChange={setMortarRatio} /></div>
                  )}
                  {masonryTypes[masonryType]?.isIL && (
                    <div className="col-span-2 bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-700">✅ No mortar between courses — bedding mortar at base only</div>
                  )}
                </div>
                <Btn onClick={calculateMasonry} />
                {masonryResult && (
                  <div>
                    <DimInfo info={masonryResult.dimInfo} />
                    <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm text-gray-600">📐 <strong>{masonryResult.typeName}</strong></div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <RC label="Wall Area" value={masonryResult.wallArea} unit="sq.m" />
                      <RC label={`Number of ${masonryResult.label}`} value={masonryResult.units} unit="nos (incl. 5% wastage)" />
                      {masonryResult.isAAC
                        ? <RC label="AAC Mortar Bags" value={masonryResult.aacBags} unit="bags (thin bed)" />
                        : masonryResult.isIL
                          ? <><RC label="Bedding Cement" value={masonryResult.cementBags} unit="bags" /><RC label="Bedding Sand (CFT)" value={masonryResult.sandCFT} unit="cu.ft" /></>
                          : <><RC label="Cement Bags" value={masonryResult.cementBags} unit="bags (50kg)" /><RC label="Sand (cu.m)" value={masonryResult.sandM3} unit="cu.m" /><RC label="Sand (CFT)" value={masonryResult.sandCFT} unit="cu.ft" /></>
                      }
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── PLASTER ── */}
            {activeCalc==="plaster" && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-6">🪣 Plastering Calculator</h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <AI label="Plaster Area" value={plasterArea} onChange={setPlasterArea} areaUnit={areaUnit} />
                  <Sel label="Plaster Thickness" value={plasterThk} onChange={setPlasterThk}>
                    <option value="6">6mm — Ceiling / Skim Coat</option>
                    <option value="12">12mm — Internal Wall</option>
                    <option value="15">15mm — External Wall</option>
                    <option value="20">20mm — Rough Surface</option>
                    <option value="25">25mm — Very Rough / Correction</option>
                  </Sel>
                  <div className="col-span-2"><MR value={plasterRatio} onChange={setPlasterRatio} /></div>
                </div>
                <Btn onClick={calculatePlaster} />
                {plasterResult && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <RC label="Plaster Area" value={plasterResult.area} unit="sq.m" />
                    <RC label="Cement Bags" value={plasterResult.cementBags} unit="bags (50kg)" />
                    <RC label="Sand (cu.m)" value={plasterResult.sand} unit="cu.m" />
                    <RC label="Sand (CFT)" value={plasterResult.sandCFT} unit="cu.ft" />
                  </div>
                )}
              </div>
            )}

            {/* ── CONCRETE ── */}
            {activeCalc==="concrete" && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">⬜ Concrete Calculator</h2>
                <p className="text-gray-500 text-sm mb-6">M10 to M45 — any structural concrete work</p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <NI label="Length" value={cLen} onChange={setCLen} lenUnit={lenUnit} />
                  <NI label="Width" value={cWid} onChange={setCWid} lenUnit={lenUnit} />
                  <NI label="Depth / Thickness" value={cDep} onChange={setCDep} lenUnit={lenUnit} />
                  <Sel label="Concrete Grade" value={concreteGrade} onChange={setConcreteGrade}>
                    {Object.entries(concreteGrades).map(([g,i]:any)=>(
                      <option key={g} value={g}>{g} — {i.use} ({i.ratio[0]}:{i.ratio[1]}:{i.ratio[2]})</option>
                    ))}
                  </Sel>
                </div>
                <Btn onClick={calculateConcrete} />
                {concreteResult && (
                  <div>
                    <DimInfo info={concreteResult.dimInfo} />
                    <h3 className="font-bold text-gray-700 mb-4">📊 {concreteGrade} — {concreteGrades[concreteGrade]?.use}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <RC label="Volume" value={concreteResult.volume} unit="cu.m" />
                      <RC label="Cement Bags" value={concreteResult.cementBags} unit="bags (50kg)" />
                      <RC label="Sand (cu.m)" value={concreteResult.sandM3} unit="cu.m" />
                      <RC label="Sand (CFT)" value={concreteResult.sandCFT} unit="cu.ft" />
                      <RC label="Aggregate (cu.m)" value={concreteResult.aggM3} unit="cu.m" />
                      <RC label="Aggregate (CFT)" value={concreteResult.aggCFT} unit="cu.ft" />
                      <RC label="Water" value={concreteResult.water} unit="litres" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── SLAB ── */}
            {activeCalc==="slab" && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">🏠 RCC Slab Calculator</h2>
                <p className="text-gray-500 text-sm mb-6">Enter slab dimensions — get all concrete materials instantly</p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <NI label="Slab Length" value={slabLen} onChange={setSlabLen} lenUnit={lenUnit} />
                  <NI label="Slab Width" value={slabWid} onChange={setSlabWid} lenUnit={lenUnit} />
                  <Sel label="Slab Thickness" value={slabThk} onChange={setSlabThk}>
                    <option value="100">100mm (4 inch)</option>
                    <option value="125">125mm (5 inch)</option>
                    <option value="150">150mm (6 inch) — Standard</option>
                    <option value="175">175mm (7 inch)</option>
                    <option value="200">200mm (8 inch)</option>
                    <option value="225">225mm (9 inch)</option>
                    <option value="250">250mm (10 inch)</option>
                  </Sel>
                  <Sel label="Concrete Grade" value={slabGrade} onChange={setSlabGrade}>
                    {Object.entries(concreteGrades).map(([g,i]:any)=>(
                      <option key={g} value={g}>{g} — {i.use}</option>
                    ))}
                  </Sel>
                </div>
                <Btn onClick={calculateSlab} />
                {slabResult && (
                  <div>
                    <DimInfo info={slabResult.dimInfo} />
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <RC label="Slab Area" value={slabResult.area} unit="sq.m" />
                      <RC label="Concrete Volume" value={slabResult.vol} unit="cu.m" />
                      <RC label="Cement Bags" value={slabResult.cementBags} unit="bags (50kg)" />
                      <RC label="Sand (cu.m)" value={slabResult.sandM3} unit="cu.m" />
                      <RC label="Sand (CFT)" value={slabResult.sandCFT} unit="cu.ft" />
                      <RC label="Aggregate (cu.m)" value={slabResult.aggM3} unit="cu.m" />
                      <RC label="Aggregate (CFT)" value={slabResult.aggCFT} unit="cu.ft" />
                      <RC label="Water" value={slabResult.water} unit="litres" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── BEAM & COLUMN ── */}
            {activeCalc==="beam" && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">🏛️ Beam & Column Calculator</h2>
                <p className="text-gray-500 text-sm mb-6">Calculate concrete for beams and columns — supports multiple members</p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="col-span-2">
                    <Sel label="Member Type" value={beamType} onChange={setBeamType}>
                      <option value="beam">Beam (horizontal)</option>
                      <option value="column">Column (vertical)</option>
                      <option value="lintel">Lintel</option>
                      <option value="plinth">Plinth Beam</option>
                    </Sel>
                  </div>
                  <NI label={beamType==="column"?"Column Height":"Beam Length"} value={beamLen} onChange={setBeamLen} lenUnit={lenUnit} />
                  <NI label="Width (breadth)" value={beamWid} onChange={setBeamWid} lenUnit={lenUnit} />
                  <NI label="Depth (height of section)" value={beamDep} onChange={setBeamDep} lenUnit={lenUnit} />
                  <Sel label="Concrete Grade" value={beamGrade} onChange={setBeamGrade}>
                    {Object.entries(concreteGrades).map(([g,i]:any)=>(
                      <option key={g} value={g}>{g} — {i.use}</option>
                    ))}
                  </Sel>
                  <div className="col-span-2">
                    <TI label="Number of Members (beams / columns)" value={beamCount} onChange={setBeamCount} placeholder="e.g. 10" />
                  </div>
                </div>
                <Btn onClick={calculateBeam} />
                {beamResult && (
                  <div>
                    <DimInfo info={beamResult.dimInfo} />
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <RC label="Single Member Volume" value={beamResult.singleVol} unit="cu.m" />
                      <RC label={`Total Volume (×${beamResult.count})`} value={beamResult.totalVol} unit="cu.m" />
                      <RC label="Cement Bags" value={beamResult.cementBags} unit="bags (50kg)" />
                      <RC label="Sand (cu.m)" value={beamResult.sandM3} unit="cu.m" />
                      <RC label="Sand (CFT)" value={beamResult.sandCFT} unit="cu.ft" />
                      <RC label="Aggregate (cu.m)" value={beamResult.aggM3} unit="cu.m" />
                      <RC label="Aggregate (CFT)" value={beamResult.aggCFT} unit="cu.ft" />
                      <RC label="Water" value={beamResult.water} unit="litres" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── FLOORING ── */}
            {activeCalc==="flooring" && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-6">🟫 Flooring Tiles Calculator</h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <NI label="Room Length" value={fLen} onChange={setFLen} lenUnit={lenUnit} />
                  <NI label="Room Width" value={fWid} onChange={setFWid} lenUnit={lenUnit} />
                  <div className="col-span-2">
                    <Sel label="Tile Size" value={`${tileLen}x${tileWid}`} onChange={(v:string)=>{const [l,w]=v.split("x");setTileLen(l);setTileWid(w);}}>
                      <option value="300x300">300×300mm (1×1 ft)</option>
                      <option value="400x400">400×400mm</option>
                      <option value="600x600">600×600mm (2×2 ft)</option>
                      <option value="800x800">800×800mm</option>
                      <option value="1200x600">1200×600mm</option>
                      <option value="600x1200">600×1200mm</option>
                    </Sel>
                  </div>
                </div>
                <Btn onClick={calculateFlooring} />
                {floorResult && (
                  <div>
                    <DimInfo info={floorResult.dimInfo} />
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <RC label="Floor Area" value={floorResult.floorArea} unit="sq.m" />
                      <RC label="Tiles Needed" value={floorResult.tilesNeeded} unit="nos (10% wastage)" />
                      <RC label="Wastage" value={floorResult.wastage} unit="extra tiles" />
                      <RC label="Boxes" value={floorResult.boxes} unit="boxes (4 tiles)" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── PAINT ── */}
            {activeCalc==="paint" && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-6">🎨 Paint Calculator</h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <AI label="Total Wall Area" value={paintArea} onChange={setPaintArea} areaUnit={areaUnit} />
                    <p className="text-xs text-gray-400 mt-1">Length × Height × No. of walls</p>
                  </div>
                  <Sel label="Number of Coats" value={paintCoats} onChange={setPaintCoats}>
                    <option value="1">1 Coat</option>
                    <option value="2">2 Coats (Recommended)</option>
                    <option value="3">3 Coats</option>
                  </Sel>
                </div>
                <Btn onClick={calculatePaint} />
                {paintResult && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <RC label="Total Paint Area" value={paintResult.totalArea} unit="sq.m" />
                    <RC label="Primer" value={paintResult.primerLitres} unit="litres" />
                    <RC label="Paint" value={paintResult.paintLitres} unit="litres" />
                    <RC label="4L Buckets" value={paintResult.paintBuckets4L} unit="buckets" />
                    <RC label="20L Buckets" value={paintResult.paintBuckets20L} unit="buckets" />
                  </div>
                )}
              </div>
            )}

            {/* ── SAND ── */}
            {activeCalc==="sand" && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">🏖️ Sand / Fill Calculator</h2>
                <p className="text-gray-500 text-sm mb-6">Backfilling · Sand bedding under tiles · Anti-termite layer · Lorry load estimation</p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <NI label="Length" value={sLen} onChange={setSLen} lenUnit={lenUnit} />
                  <NI label="Width" value={sWid} onChange={setSWid} lenUnit={lenUnit} />
                  <div className="col-span-2"><NI label="Depth / Thickness" value={sDep} onChange={setSDep} lenUnit={lenUnit} /></div>
                </div>
                <Btn onClick={calculateSand} />
                {sandResult && (
                  <div>
                    <DimInfo info={sandResult.dimInfo} />
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <RC label="Volume" value={sandResult.volume} unit="cu.m" />
                      <RC label="Volume (CFT)" value={sandResult.volumeCFT} unit="cu.ft" />
                      <RC label="Weight" value={sandResult.weightTons} unit="tons" />
                      <RC label="Lorry Loads" value={sandResult.lorryLoads} unit="loads (100 CFT each)" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── STAIRCASE ── */}
            {activeCalc==="staircase" && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">🪜 Staircase Calculator</h2>
                <p className="text-gray-500 text-sm mb-2">Auto-calculates number of steps · IS Code compliant</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-xs text-blue-700">
                  ℹ️ Floor height &amp; width use your selected unit above. Riser &amp; Tread are always in <strong>mm</strong>.
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="col-span-2"><NI label="Floor to Floor Height" value={stairFH} onChange={setStairFH} lenUnit={lenUnit} /></div>
                  <NI label="Staircase Width" value={stairW} onChange={setStairW} lenUnit={lenUnit} />
                  <Sel label="Preferred Riser Height (mm)" value={stairRiser} onChange={setStairRiser}>
                    <option value="125">125mm (Low / Comfortable)</option>
                    <option value="150">150mm (Standard IS Code)</option>
                    <option value="160">160mm</option>
                    <option value="175">175mm (Max IS Code)</option>
                  </Sel>
                  <Sel label="Tread Width (mm)" value={stairTread} onChange={setStairTread}>
                    <option value="250">250mm (Min IS Code)</option>
                    <option value="270">270mm (Standard)</option>
                    <option value="300">300mm (Comfortable)</option>
                    <option value="350">350mm (Grand)</option>
                  </Sel>
                  <Sel label="Waist Slab Thickness (mm)" value={stairThk} onChange={setStairThk}>
                    <option value="125">125mm</option>
                    <option value="150">150mm (Standard)</option>
                    <option value="175">175mm</option>
                    <option value="200">200mm</option>
                  </Sel>
                </div>
                <Btn onClick={calculateStaircase} />
                {stairWarnings.length>0 && (
                  <div className="mb-4 space-y-2">
                    {stairWarnings.map((w,i)=>(
                      <div key={i} className={`rounded-lg p-3 text-xs ${w.startsWith("⚠️")?"bg-red-50 border border-red-200 text-red-700":"bg-yellow-50 border border-yellow-200 text-yellow-700"}`}>{w}</div>
                    ))}
                  </div>
                )}
                {stairResult && (
                  <div>
                    <div className="bg-gray-50 rounded-xl p-4 mb-6 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      <div><p className="text-xs text-gray-500">Floor Height</p><p className="font-bold">{stairResult.fhM}m / {stairResult.fhMm}mm / {stairResult.fhFt}ft</p></div>
                      <div><p className="text-xs text-gray-500">Staircase Width</p><p className="font-bold">{stairResult.wM}m</p></div>
                      <div><p className="text-xs text-gray-500">Total Run</p><p className="font-bold">{stairResult.runM}m</p></div>
                      <div><p className="text-xs text-gray-500">Actual Riser</p><p className="font-bold text-teal-700">{stairResult.riserMm}mm</p></div>
                      <div><p className="text-xs text-gray-500">Tread</p><p className="font-bold text-teal-700">{stairResult.treadMm}mm</p></div>
                      <div><p className="text-xs text-gray-500">Tile Area</p><p className="font-bold">{stairResult.tileArea} sq.m</p></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <RC label="Number of Steps" value={stairResult.steps} unit="nos (auto calculated)" />
                      <RC label="Concrete Volume" value={stairResult.vol} unit="cu.m (M20)" />
                      <RC label="Cement Bags" value={stairResult.cementBags} unit="bags (50kg)" />
                      <RC label="Sand (CFT)" value={stairResult.sandCFT} unit="cu.ft" />
                      <RC label="Aggregate (CFT)" value={stairResult.aggCFT} unit="cu.ft" />
                      <RC label="Tiles Needed" value={stairResult.tilesNeeded} unit="nos (600×600mm)" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── OPENINGS ── */}
            {activeCalc==="openings" && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">🪟 Door & Window Deduction</h2>
                <p className="text-gray-500 text-sm mb-6">Deduct openings from wall area for accurate brickwork &amp; plaster</p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <NI label="Wall Length" value={oWLen} onChange={setOWLen} lenUnit={lenUnit} />
                  <NI label="Wall Height" value={oWHgt} onChange={setOWHgt} lenUnit={lenUnit} />
                  <TI label="Number of Doors" value={numDoors} onChange={setNumDoors} placeholder="e.g. 2" />
                  <Sel label="Door Size" value={`${doorW}x${doorH}`} onChange={(v:string)=>{const [w,h]=v.split("x");setDoorW(w);setDoorH(h);}}>
                    <option value="0.9x2.1">0.9×2.1m (Standard)</option>
                    <option value="1.0x2.1">1.0×2.1m</option>
                    <option value="1.2x2.1">1.2×2.1m (Double)</option>
                    <option value="0.75x2.0">0.75×2.0m (Bathroom)</option>
                  </Sel>
                  <TI label="Number of Windows" value={numWindows} onChange={setNumWindows} placeholder="e.g. 3" />
                  <Sel label="Window Size" value={`${winW}x${winH}`} onChange={(v:string)=>{const [w,h]=v.split("x");setWinW(w);setWinH(h);}}>
                    <option value="1.2x1.2">1.2×1.2m (Standard)</option>
                    <option value="1.5x1.2">1.5×1.2m</option>
                    <option value="1.8x1.2">1.8×1.2m (Large)</option>
                    <option value="0.6x0.6">0.6×0.6m (Ventilator)</option>
                  </Sel>
                </div>
                <Btn onClick={calculateOpenings} />
                {openingsResult && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <RC label="Gross Wall Area" value={openingsResult.gross} unit="sq.m" />
                    <RC label="Door Area" value={openingsResult.dA} unit="sq.m" />
                    <RC label="Window Area" value={openingsResult.wA} unit="sq.m" />
                    <RC label="Net Wall Area" value={openingsResult.net} unit="sq.m (use for brickwork)" />
                    <RC label="Deduction" value={openingsResult.deduction+"%"} unit="of total wall" />
                    <RC label="Bricks Saved" value={openingsResult.bricksSaved} unit="nos" />
                  </div>
                )}
              </div>
            )}

            {/* ── FOOTING ── */}
            {activeCalc==="footing" && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">🏗️ Footing / Foundation Calculator</h2>
                <p className="text-gray-500 text-sm mb-6">Excavation + PCC (M10) + Footing Concrete</p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <NI label="Footing Length" value={ftLen} onChange={setFtLen} lenUnit={lenUnit} />
                  <NI label="Footing Width" value={ftWid} onChange={setFtWid} lenUnit={lenUnit} />
                  <NI label="Footing Depth" value={ftDep} onChange={setFtDep} lenUnit={lenUnit} />
                  <Sel label="PCC Thickness" value={pccThk} onChange={setPccThk}>
                    <option value="0.075">75mm</option>
                    <option value="0.1">100mm (Standard)</option>
                    <option value="0.15">150mm</option>
                  </Sel>
                  <div className="col-span-2">
                    <Sel label="Footing Concrete Grade" value={footingGrade} onChange={setFootingGrade}>
                      <option value="M15">M15 (1:2:4)</option>
                      <option value="M20">M20 (1:1.5:3) — Recommended</option>
                      <option value="M25">M25 (1:1:2)</option>
                    </Sel>
                  </div>
                </div>
                <Btn onClick={calculateFooting} />
                {footingResult && (
                  <div>
                    <DimInfo info={footingResult.dimInfo} />
                    <p className="font-semibold text-gray-700 mb-3">🏗️ Excavation</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      <RC label="Excavation Volume" value={footingResult.excavVol} unit="cu.m" />
                      <RC label="Excavation (CFT)" value={footingResult.excavCFT} unit="cu.ft" />
                    </div>
                    <p className="font-semibold text-gray-700 mb-3">⬜ PCC (M10)</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      <RC label="PCC Volume" value={footingResult.pccVol} unit="cu.m" />
                      <RC label="Cement Bags" value={footingResult.pccCement} unit="bags" />
                      <RC label="Sand (CFT)" value={footingResult.pccSand} unit="cu.ft" />
                      <RC label="Aggregate (CFT)" value={footingResult.pccAgg} unit="cu.ft" />
                    </div>
                    <p className="font-semibold text-gray-700 mb-3">🏗️ Footing ({footingGrade})</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <RC label="Footing Volume" value={footingResult.footVol} unit="cu.m" />
                      <RC label="Cement Bags" value={footingResult.footCement} unit="bags" />
                      <RC label="Sand (CFT)" value={footingResult.footSand} unit="cu.ft" />
                      <RC label="Aggregate (CFT)" value={footingResult.footAgg} unit="cu.ft" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── WATERPROOFING ── */}
            {activeCalc==="waterproofing" && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">🌧️ Waterproofing Calculator</h2>
                <p className="text-gray-500 text-sm mb-6">Terrace · Bathroom · Basement waterproofing chemical quantity</p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <AI label="Area to Waterproof" value={wpArea} onChange={setWpArea} areaUnit={areaUnit} />
                  <Sel label="Waterproofing Type" value={wpType} onChange={setWpType}>
                    <option value="drfixit">Dr. Fixit Roofseal</option>
                    <option value="crystalline">Crystalline Waterproofing</option>
                    <option value="membrane">APP/SBS Membrane Sheet</option>
                    <option value="pidilite">Pidilite Dr. Fixit LW+</option>
                  </Sel>
                </div>
                <Btn onClick={calculateWaterproofing} />
                {wpResult && (
                  <div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-700">ℹ️ <strong>{wpResult.name}</strong> — {wpResult.extra}</div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <RC label="Area" value={wpResult.area} unit="sq.m" />
                      <RC label="Total Quantity" value={wpResult.qty} unit="kg / litres" />
                      {wpResult.rolls
                        ? <RC label="Rolls" value={wpResult.rolls} unit="rolls (1m×10m)" />
                        : <><RC label="5kg Bags" value={wpResult.bags5} unit="bags" /><RC label="20kg Bags" value={wpResult.bags20} unit="bags" /></>
                      }
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── SEPTIC TANK ── */}
            {activeCalc==="septictank" && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">🚽 Septic Tank Calculator</h2>
                <p className="text-gray-500 text-sm mb-6">Calculate septic tank size — as per IS 2470</p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <TI label="Number of Users (persons)" value={septicUsers} onChange={setSepticUsers} placeholder="e.g. 10" />
                  <Sel label="Building Type" value={septicType} onChange={setSepticType}>
                    <option value="residential">Residential (135 lpd/person)</option>
                    <option value="commercial">Commercial / Office (45 lpd/person)</option>
                    <option value="school">School / Institution (20 lpd/person)</option>
                  </Sel>
                </div>
                <Btn onClick={calculateSepticTank} />
                {septicResult && (
                  <div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-sm text-blue-700 grid grid-cols-3 gap-3">
                      <div><p className="text-xs opacity-70">Daily Flow</p><p className="font-bold">{septicResult.dailyFlow} m³/day</p></div>
                      <div><p className="text-xs opacity-70">Liquid Capacity</p><p className="font-bold">{septicResult.liquidCap} m³</p></div>
                      <div><p className="text-xs opacity-70">Sludge Capacity</p><p className="font-bold">{septicResult.sludgeCap} m³</p></div>
                    </div>
                    <p className="font-semibold text-gray-700 mb-3">📐 Recommended Tank Dimensions</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <RC label="Total Volume" value={septicResult.totalVol} unit="cu.m" />
                      <RC label="Length" value={septicResult.length} unit="m" />
                      <RC label="Width" value={septicResult.width} unit="m" />
                      <RC label="Depth" value={septicResult.depth} unit="m" />
                      <RC label="Cement Bags (walls)" value={septicResult.cementBags} unit="bags (M20)" />
                      <RC label="Sand (CFT)" value={septicResult.sandCFT} unit="cu.ft" />
                      <RC label="Aggregate (CFT)" value={septicResult.aggCFT} unit="cu.ft" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── WATER TANK ── */}
            {activeCalc==="watertank" && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">💧 Water Tank Capacity Calculator</h2>
                <p className="text-gray-500 text-sm mb-6">Calculate required capacity · Check if your existing tank is sufficient</p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <TI label="Number of Persons" value={tankUsers} onChange={setTankUsers} placeholder="e.g. 5" />
                  <Sel label="Storage Days" value={tankDays} onChange={setTankDays}>
                    <option value="1">1 Day (Standard)</option>
                    <option value="2">2 Days (Extra Storage)</option>
                    <option value="3">3 Days (Backup)</option>
                  </Sel>
                  <div className="col-span-2">
                    <Sel label="Tank Shape" value={tankShape} onChange={setTankShape}>
                      <option value="rectangular">Rectangular / Square</option>
                      <option value="circular">Circular / Cylindrical</option>
                    </Sel>
                  </div>
                  <p className="col-span-2 text-xs text-gray-500 -mb-2">Enter your tank dimensions to check if it is sufficient:</p>
                  {tankShape==="rectangular" ? (
                    <>
                      <NI label="Tank Length" value={tankLen} onChange={setTankLen} lenUnit={lenUnit} />
                      <NI label="Tank Width" value={tankWid} onChange={setTankWid} lenUnit={lenUnit} />
                    </>
                  ) : (
                    <NI label="Tank Diameter" value={tankDia} onChange={setTankDia} lenUnit={lenUnit} />
                  )}
                  <NI label="Tank Height / Depth" value={tankHgt} onChange={setTankHgt} lenUnit={lenUnit} />
                </div>
                <Btn onClick={calculateWaterTank} />
                {tankResult && (
                  <div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-sm text-blue-700">
                      👥 <strong>{tankResult.users} persons</strong> × 135 lpd × {tankResult.days} day(s) = <strong>{tankResult.totalLitres} litres required</strong>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <RC label="Required Capacity" value={tankResult.totalLitres} unit="litres" />
                      <RC label="Required (cu.m)" value={tankResult.totalM3} unit="cu.m" />
                      {tankResult.cap && (
                        <>
                          <RC label="Your Tank Capacity" value={tankResult.cap} unit="litres" />
                          <div className={`rounded-xl p-4 text-center border-2 col-span-2 md:col-span-3 ${tankResult.sufficient?"bg-green-50 border-green-400":"bg-red-50 border-red-400"}`}>
                            <p className={`text-2xl font-bold ${tankResult.sufficient?"text-green-700":"text-red-700"}`}>
                              {tankResult.sufficient?"✅ Tank is SUFFICIENT":"❌ Tank is INSUFFICIENT"}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {tankResult.sufficient
                                ?`Surplus: ${(+tankResult.cap - tankResult.totalLitres).toFixed(0)} litres extra`
                                :`Shortfall: ${(tankResult.totalLitres - +tankResult.cap).toFixed(0)} litres short`}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── FULL ESTIMATE ── */}
            {activeCalc==="estimate" && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">🧰 Full House Material Estimate</h2>
                <p className="text-gray-500 text-sm mb-2">Approximate material quantities for your entire house</p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6 text-xs text-yellow-800">
                  ⚠️ Rough estimate based on thumb rules. Always consult an engineer.
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <NI label="Plot Length" value={estPLen} onChange={setEstPLen} lenUnit={lenUnit} />
                  <NI label="Plot Width" value={estPWid} onChange={setEstPWid} lenUnit={lenUnit} />
                  <Sel label="Number of Floors" value={estFloors} onChange={setEstFloors}>
                    <option value="1">Ground Floor Only</option>
                    <option value="2">Ground + 1st Floor</option>
                    <option value="3">Ground + 2 Floors</option>
                    <option value="4">Ground + 3 Floors</option>
                  </Sel>
                  <Sel label="Floor to Floor Height (m)" value={estFloorHeight} onChange={setEstFloorHeight}>
                    <option value="2.75">2.75m</option>
                    <option value="3.0">3.0m (Standard)</option>
                    <option value="3.2">3.2m</option>
                    <option value="3.5">3.5m (Premium)</option>
                  </Sel>
                </div>
                <Btn onClick={calculateEstimate} />
                {estResult && (
                  <div>
                    <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm text-gray-600">
                      🏠 Built-up: <strong>{estResult.bua} sq.m/floor</strong> · Total: <strong>{estResult.total} sq.m</strong>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <RC label="Bricks Required" value={estResult.bricks.toLocaleString()} unit="nos" />
                      <RC label="Cement Bags (Total)" value={estResult.totalC} unit="bags (50kg)" />
                      <RC label="Sand (cu.m)" value={estResult.totalS} unit="cu.m" />
                      <RC label="Sand (CFT)" value={estResult.totalSCFT} unit="cu.ft" />
                      <RC label="Aggregate (cu.m)" value={estResult.aggM3} unit="cu.m" />
                      <RC label="Aggregate (CFT)" value={estResult.aggCFT} unit="cu.ft" />
                      <RC label="Floor Tiles" value={estResult.tiles.toLocaleString()} unit="nos (600×600mm)" />
                      <RC label="Paint" value={estResult.paintL} unit="litres" />
                      <RC label="Paint (20L Buckets)" value={estResult.paintB20} unit="buckets" />
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-6 text-sm text-yellow-800">
            ⚠️ <strong>Disclaimer:</strong> All calculations are approximate and based on standard IS code thumb rules. Always consult a qualified Civil Engineer or Architect before procurement. Add 5–10% extra for wastage and breakage.
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}