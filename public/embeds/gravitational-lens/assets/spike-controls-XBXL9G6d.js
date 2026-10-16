import{F as e,jt as t,mt as n,u as r,vt as i}from"./bloom-CCn9Y3xI.js";var a=66743e-15,o=299792458,s=198892e25,c=696e6,l=149597870700,u=86400,d=365.25*u,f=4*a*s/(o*o),p=225e-9;function m(e){return f/e}function h(e){return e*e/f}function g(e){return Math.sqrt(f/e)}function _(e){return c/e}var v=648e3/Math.PI,y=180/Math.PI;function b(e){return e*l}function x(e){return e/l}function S(e){return e*v}function C(e){return e/y}function w(e){return e/o}var T=512;function E(e){let t=e>>>0;return()=>(t=t*1664525+1013904223>>>0,t/4294967295)}function D(e){let t=Array.from({length:256},(e,t)=>t);for(let n=t.length-1;n>0;n--){let r=Math.floor(e()*(n+1)),i=t[n];t[n]=t[r],t[r]=i}return t.concat(t)}function O(e){return e*e*(3-2*e)}function k(e,t){let n=(n,r)=>e[e[(n%t+t)%t]+r&255]/255;return(e,t)=>{let r=Math.floor(e),i=Math.floor(t),a=e-r,o=t-i,s=O(a),c=O(o),l=n(r,i)*(1-s)+n(r+1,i)*s,u=n(r,i+1)*(1-s)+n(r+1,i+1)*s;return l*(1-c)+u*c}}function A(e=550){let t=document.createElement(`canvas`);t.width=T,t.height=T;let n=t.getContext(`2d`);if(!n)throw Error(`2d context unavailable`);let r=E(e),i=k(D(r),8),a=k(D(r),8),o=(e,t,n)=>{let r=0,i=.5,a=1;for(let o=0;o<5;o++)r+=i*e(t*a,n*a),i*=.5,a*=2;return r},s=n.createImageData(T,T);for(let e=0;e<T;e++)for(let t=0;t<T;t++){let n=t/T*8,r=e/T*8,c=Math.abs(e/T-.5)*2,l=o(i,n,r),u,d,f;if(l>.58){let e=(l-.58)/.42;u=96+70*e,d=82+52*e,f=48+30*e}else if(l>.54)u=194,d=178,f=128;else{let e=l/.54;u=8+20*e,d=40+45*e,f=92+70*e}let p=Math.max(0,(c-.78)/.22+(l-.6)*.3);if(p>0){let e=Math.min(1,p*1.6);u=u*(1-e)+235*e,d=d*(1-e)+240*e,f=f*(1-e)+245*e}let m=o(a,n*1.7+3,r*1.7+3);if(m>.56){let e=Math.min(1,(m-.56)*4);u=u*(1-e)+230*e,d=d*(1-e)+232*e,f=f*(1-e)+236*e}let h=(e*T+t)*4;s.data[h]=u,s.data[h+1]=d,s.data[h+2]=f,s.data[h+3]=255}return n.putImageData(s,0,0),t}function j(t=550){let i=new r(A(t));return i.wrapS=n,i.minFilter=e,i.magFilter=e,i}var M=`
void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`,N=`
uniform vec2 uResolution;    // drawing buffer size, device px
uniform float uArcsecPerPx;  // angular scale, arcsec per device px
uniform float uThetaE;       // Einstein ring angular radius, arcsec
uniform float uThetaSun;     // solar photosphere angular radius, arcsec
uniform float uOcculterRsun; // coronagraph occulter radius, R_sun units
uniform vec2 uBetaS;         // source offset from the optical axis, arcsec
uniform float uSrcRadius;    // source angular radius, arcsec (exaggerated)
uniform float uJ2;           // effective quadrupole strength, 0 disables
uniform float uPoleAngle;    // solar rotation axis position angle, rad
uniform float uExposure;
uniform float uTime;
uniform sampler2D uSrcTex;      // procedural exoplanet map, wraps in x
uniform sampler2D uCorona;      // SOHO LASCO C2 frame
uniform float uHasCorona;       // 0 = procedural fallback everywhere
uniform float uCoronaHalfWidthRsun; // LASCO image half-width, R_sun units
uniform float uLascoInnerRsun;      // LASCO occulter edge, R_sun units

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * vnoise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}

// Inverse thin-lens mapping, image angle -> source angle (see sim/lensing.ts)
vec2 lensToSource(vec2 theta) {
  float r2 = dot(theta, theta);
  float r = sqrt(r2);
  vec2 er = theta / r;
  float q = uJ2 * uThetaSun * uThetaSun / r2;
  float twoD = 2.0 * (atan(theta.y, theta.x) - uPoleAngle);
  float aR = (uThetaE * uThetaE / r) * (1.0 - q * cos(twoD));
  float aT = -(uThetaE * uThetaE / r) * q * sin(twoD);
  return theta - vec2(aR * er.x - aT * er.y, aR * er.y + aT * er.x);
}

// Radial streamer structure: azimuthal fbm sampled on the unit circle so the
// pattern stays continuous, stretched radially like real coronal rays.
vec3 proceduralCorona(vec2 er, float rho) {
  float streaks = fbm(er * 3.1 + 7.0);
  float rays = fbm(er * 9.0 + 41.0);
  float base = pow(max(rho, 1.0), -3.0);
  float b = base * (0.30 + 1.1 * streaks * streaks + 0.35 * rays);
  return vec3(1.0, 0.42, 0.13) * b * 1.1;
}

vec3 coronaColor(vec2 theta, vec2 er, float rho) {
  vec3 proc = proceduralCorona(er, rho);
  if (uHasCorona < 0.5) return proc;
  vec2 uv = vec2(0.5) + theta / (2.0 * uCoronaHalfWidthRsun * uThetaSun);
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return proc;
  vec3 las = texture2D(uCorona, uv).rgb;
  las = las * las * 0.4; // approx sRGB to linear, gain matched to procedural
  float w = smoothstep(uLascoInnerRsun, uLascoInnerRsun + 0.5, rho)
          * (1.0 - smoothstep(5.5, 6.1, rho));
  return mix(proc, las, w);
}

vec3 lensedLight(vec2 theta) {
  vec2 beta = lensToSource(theta);
  vec2 d = (beta - uBetaS) / uSrcRadius;
  float m2 = dot(d, d);
  if (m2 > 1.0) return vec3(0.0);
  float m = sqrt(m2);
  vec2 uv = vec2(fract(0.5 + 0.5 * d.x + uTime * 0.008), 0.5 + 0.5 * d.y);
  vec3 c = texture2D(uSrcTex, uv).rgb;
  c = c * c;
  float limb = sqrt(max(0.0, 1.0 - m2)); // limb darkening on the source disc
  float edge = 1.0 - smoothstep(0.9, 1.0, m);
  return c * (5.0 * limb * edge);
}

void main() {
  vec2 theta = (gl_FragCoord.xy - 0.5 * uResolution) * uArcsecPerPx;
  float r = length(theta);
  vec2 er = r > 0.0 ? theta / r : vec2(1.0, 0.0);
  float rho = r / uThetaSun;

  vec3 color = coronaColor(theta, er, rho) + lensedLight(theta);

  float occR = uOcculterRsun * uThetaSun;
  float soft = 0.75 * uArcsecPerPx;
  float open = smoothstep(occR - soft, occR + soft, r);
  vec3 occulter = vec3(0.004, 0.005, 0.007);
  color = mix(occulter, color, open);

  gl_FragColor = vec4(color * uExposure, 1.0);
}
`;function P(){return new i({vertexShader:M,fragmentShader:N,depthTest:!1,depthWrite:!1,transparent:!0,uniforms:{uResolution:{value:new t(1,1)},uArcsecPerPx:{value:.01},uThetaE:{value:1.61},uThetaSun:{value:1.48},uOcculterRsun:{value:1.04},uBetaS:{value:new t(0,0)},uSrcRadius:{value:.05},uJ2:{value:0},uPoleAngle:{value:Math.PI/2},uExposure:{value:1},uTime:{value:0},uSrcTex:{value:null},uCorona:{value:null},uHasCorona:{value:0},uCoronaHalfWidthRsun:{value:6.35},uLascoInnerRsun:{value:2.25}}})}var F=.05;function I(e){let t=document.createElement(`div`);t.className=`ctl-row`;let n=document.createElement(`span`);n.className=`ctl-label`,n.textContent=e;let r=document.createElement(`span`);return r.className=`ctl-value`,t.append(n,r),{wrap:t,value:r}}function L(e,t,n,r,i,a,o,s){let{wrap:c,value:l}=I(t),u=document.createElement(`input`);u.type=`range`,u.min=String(n),u.max=String(r),u.step=String(i),u.value=String(a),l.textContent=o(a),u.addEventListener(`input`,()=>{let e=Number(u.value);l.textContent=o(e),s(e)}),c.appendChild(u),e.appendChild(c)}function R(e,t,n,r,i){let a=document.createElement(`div`);a.className=`ctl-row`;let o=document.createElement(`button`);if(o.className=`ctl-toggle`,o.setAttribute(`aria-pressed`,String(r)),o.textContent=t,r&&o.classList.add(`on`),o.addEventListener(`click`,()=>{let e=!o.classList.contains(`on`);o.classList.toggle(`on`,e),o.setAttribute(`aria-pressed`,String(e)),i(e)}),a.appendChild(o),n){let e=document.createElement(`span`);e.className=`ctl-note`,e.textContent=n,a.appendChild(e)}e.appendChild(a)}var z=class{onChange;state={zAU:650,offsetArcsec:0,j2On:!1,exposure:1,fovArcsec:8,guidesOn:!0};readoutValues=new Map;status;constructor(e,t){this.onChange=t;let n=document.createElement(`div`);n.className=`spike-panel`;let r=document.createElement(`div`);r.className=`panel-title`,r.textContent=`LENS PARAMETERS`,n.appendChild(r);let i=this.state,a=(e,t)=>{i[e]=t,this.onChange()};L(n,`HELIOCENTRIC DISTANCE`,548,1200,1,i.zAU,e=>`${e.toFixed(0)} AU`,e=>a(`zAU`,e)),L(n,`SOURCE OFF-AXIS OFFSET`,0,2,.005,i.offsetArcsec,e=>`${e.toFixed(3)} arcsec`,e=>a(`offsetArcsec`,e)),L(n,`EXPOSURE`,.2,4,.05,i.exposure,e=>`${e.toFixed(2)}x`,e=>a(`exposure`,e)),L(n,`FIELD OF VIEW`,4,24,.5,i.fovArcsec,e=>`${e.toFixed(1)} arcsec`,e=>a(`fovArcsec`,e));let o=F/p;R(n,`J2 QUADRUPOLE`,`exaggerated ${Math.round(o/1e3)}k x for visibility, true J2 ${p}`,i.j2On,e=>a(`j2On`,e)),R(n,`ANGULAR GUIDES`,``,i.guidesOn,e=>a(`guidesOn`,e));let s=document.createElement(`div`);s.className=`panel-title`,s.textContent=`COMPUTED LIVE`,n.appendChild(s);for(let[e,t]of[[`thetaE`,`EINSTEIN RING theta_E`],[`thetaSun`,`SOLAR LIMB`],[`impact`,`RING IMPACT PARAMETER`],[`occulter`,`CORONAGRAPH OCCULTER`]]){let{wrap:r,value:i}=I(t);this.readoutValues.set(e,i),n.appendChild(r)}this.status=document.createElement(`div`),this.status.className=`spike-status`,n.appendChild(this.status),e.appendChild(n)}updateReadouts(e){this.readoutValues.get(`thetaE`).textContent=`${e.thetaEArcsec.toFixed(3)} arcsec`,this.readoutValues.get(`thetaSun`).textContent=`${e.thetaSunArcsec.toFixed(3)} arcsec`,this.readoutValues.get(`impact`).textContent=`${e.ringImpactRsun.toFixed(3)} R_sun`,this.readoutValues.get(`occulter`).textContent=`${e.occulterRsun.toFixed(2)} R_sun`,this.status.textContent=e.ringVisible?`Ring clear of the occulter`:`Ring behind the occulter: move outward along the focal line`,this.status.classList.toggle(`warn`,!e.ringVisible)}};export{u as _,j as a,c as b,w as c,m as d,g as f,o as g,l as h,A as i,x as l,_ as m,z as n,b as o,h as p,P as r,C as s,F as t,S as u,a as v,d as x,s as y};