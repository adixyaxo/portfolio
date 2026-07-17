import{r as f,j as qe}from"./motion-o1F108bY.js";const o={colors:["#3b0f6f","#8b2fc9","#e84a8a","#ffae5c"],speed:.6,scale:.5,seed:8,turbAmp:.5,turbFreq:.6,turbIter:8,waveFreq:2.5,distBias:.1,jellify:0,ditherMode:"smooth",dither:.06,exposure:1.2,contrast:1.15,saturation:1.1,loop:0},je={sunset:{...o,colors:["#3b0f6f","#8b2fc9","#e84a8a","#ffae5c"]},subtleDark:{...o,colors:["#050505","#0f0f0f","#0a0a0a","#1a1a1a","#141414"],speed:1,scale:.4,seed:3,ditherMode:"off",exposure:1.1,contrast:1.1,saturation:1,distBias:0},vibrant:{...o,colors:["#ff0055","#0055ff","#00ffaa","#ffaa00","#7700ff"],seed:42,contrast:1.2,saturation:1.2},aurora:{...o,colors:["#051105","#0a3311","#055533","#11aa44","#0a1122"],speed:.4,scale:.6,seed:12,turbAmp:.6,turbFreq:.8,turbIter:10,waveFreq:1.5,distBias:-.2,ditherMode:"grain",dither:.04,exposure:1.3},magma:{...o,colors:["#110000","#330500","#661100","#aa3300","#ff6600"],speed:.8,scale:.3,seed:7,waveFreq:3,distBias:.3,contrast:1.3,saturation:1.3}},Be=`#version 300 es
precision highp float;
in vec2 a_position;
in vec2 a_texCoord;
out vec2 v_uv;
void main() {
    v_uv = a_texCoord;
    gl_Position = vec4(a_position, 0.0, 1.0);
}`,Oe=`#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;

#define NUM_COLORS 8
uniform vec4 u_colors[NUM_COLORS];
uniform int u_colors_length;

uniform float u_seed;
uniform float u_speed;
uniform float u_loop;
uniform float u_scale;
uniform float u_turbAmp;
uniform float u_turbFreq;
uniform float u_turbIter;
uniform float u_waveFreq;
uniform float u_distBias;
uniform float u_jellify;
uniform float u_ditherMode;
uniform float u_dither;
uniform float u_exposure;
uniform float u_contrast;
uniform float u_saturation;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_pixelRatio;

const float GOLDEN_ANGLE = 2.3999632;
const float TAU = 6.28318530;

uvec3 hash3(uvec3 v) {
    v = v * 1664525u + 1013904223u;
    v.x += v.y * v.z;
    v.y += v.z * v.x;
    v.z += v.x * v.y;
    v ^= v >> 16u;
    v.x += v.y * v.z;
    v.y += v.z * v.x;
    v.z += v.x * v.y;
    return v;
}

vec3 seedRandom(float seedVal) {
    uvec3 s = uvec3(
        floatBitsToUint(seedVal),
        floatBitsToUint(seedVal * 1.5 + 7.31),
        floatBitsToUint(seedVal * 2.7 + 13.37)
    );
    s = hash3(s);
    return vec3(s) / float(0xFFFFFFFFu);
}

vec3 toLinear(vec3 c) {
    return pow(c, vec3(2.2));
}

vec3 toSrgb(vec3 c) {
    return pow(clamp(c, 0.0, 1.0), vec3(0.4545));
}

vec3 linearToOklab(vec3 c) {
    float l = 0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b;
    float m = 0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b;
    float s = 0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b;

    l = pow(max(l, 0.0), 1.0/3.0);
    m = pow(max(m, 0.0), 1.0/3.0);
    s = pow(max(s, 0.0), 1.0/3.0);

    return vec3(
        0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
        1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
        0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
    );
}

vec3 oklabToLinear(vec3 c) {
    float l = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;
    float m = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;
    float s = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;

    l = l * l * l;
    m = m * m * m;
    s = s * s * s;

    return vec3(
        +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
    );
}

vec3 oklabToLch(vec3 lab) {
    return vec3(lab.x, length(lab.yz), atan(lab.z, lab.y));
}

vec3 lchToOklab(vec3 lch) {
    return vec3(lch.x, lch.y * cos(lch.z), lch.y * sin(lch.z));
}

vec3 mixLch(vec3 lab0, vec3 lab1, float t) {
    vec3 lch0 = oklabToLch(lab0);
    vec3 lch1 = oklabToLch(lab1);

    if (lch0.y < 0.05) lch0.z = lch1.z;
    if (lch1.y < 0.05) lch1.z = lch0.z;

    float dh = lch1.z - lch0.z;
    if (dh > 3.14159265) dh -= 6.28318530;
    if (dh < -3.14159265) dh += 6.28318530;

    return lchToOklab(vec3(
        mix(lch0.x, lch1.x, t),
        mix(lch0.y, lch1.y, t),
        lch0.z + dh * t
    ));
}

vec3 getColor(int idx) {
    if (u_colors_length < 1) return vec3(0.0);
    int safeIdx = clamp(idx, 0, u_colors_length - 1);
    return u_colors[safeIdx].rgb;
}

vec3 paletteN(float t, int count) {
    if (count < 1) return vec3(0.0);
    if (count < 2) return toLinear(getColor(0));

    float segmentSize = 1.0 / float(count - 1);
    t = clamp(t, 0.0, 1.0);
    int idx = min(int(floor(t / segmentSize)), count - 2);
    float localT = clamp((t - float(idx) * segmentSize) / segmentSize, 0.0, 1.0);

    vec3 lab0 = linearToOklab(toLinear(getColor(idx)));
    vec3 lab1 = linearToOklab(toLinear(getColor(idx + 1)));

    return oklabToLinear(mixLch(lab0, lab1, localT));
}

float IGN(vec2 uv) {
    return fract(52.9829189 * fract(dot(uv, vec2(0.06711056, 0.00583715))));
}

float quickNoise(vec2 I) {
    return fract(sin(dot(I, vec2(12.9898, 78.233))) * 43758.5453);
}

// 0 = off, 1 = smooth (IGN), 2 = grain
float getDither(vec2 I, float mode) {
    if (mode < 0.5) return 0.5;
    if (mode < 1.5) return IGN(I);
    return quickNoise(I);
}

vec3 softGamutMap(vec3 linearRgb) {
    float maxC = max(linearRgb.r, max(linearRgb.g, linearRgb.b));
    float minC = min(linearRgb.r, min(linearRgb.g, linearRgb.b));

    if (minC >= 0.0 && maxC <= 1.0) return linearRgb;

    vec3 lab = linearToOklab(max(linearRgb, 0.0));
    float L = clamp(lab.x, 0.0, 1.0);
    float C = length(lab.yz);
    float h = atan(lab.z, lab.y);

    float maxChroma = 0.4 * (1.0 - pow(abs(2.0 * L - 1.0), 2.0));

    if (C > maxChroma * 0.7) {
        float knee = maxChroma * 0.7;
        C = knee + (maxChroma - knee) * tanh((C - knee) / (maxChroma - knee + 0.001));
    }

    return clamp(oklabToLinear(vec3(L, C * cos(h), C * sin(h))), 0.0, 1.0);
}

vec3 applyContrastSaturation(vec3 linearRgb, float contrast, float saturation) {
    vec3 lab = linearToOklab(linearRgb);
    float C = length(lab.yz);
    float h = atan(lab.z, lab.y);

    lab.x = clamp((lab.x - 0.5) * contrast + 0.5, 0.0, 1.0);
    C *= saturation;
    lab.y = C * cos(h);
    lab.z = C * sin(h);

    return oklabToLinear(lab);
}

void main() {
    vec2 fragCoord = v_uv * u_resolution;
    vec2 r = u_resolution;
    vec2 p = (fragCoord * 2.0 - r) / r.y;

    int colorCount = u_colors_length;

    if (colorCount < 1) {
        fragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
    }

    float t = u_time * 0.3;

    // Map time onto a circle so the animation wraps seamlessly when looping.
    float looping = step(0.5, u_loop);
    float phase = TAU * u_time / max(u_loop, 0.01);
    float radius = u_loop * u_speed * 0.3 / TAU;
    float tA = sin(phase) * radius;
    float tB = (1.0 - cos(phase)) * radius;

    vec3 seedOffset = seedRandom(u_seed);
    vec3 seedOffset2 = seedRandom(u_seed + 100.0);

    float seedAngle = u_seed * GOLDEN_ANGLE;
    vec2 seedPhase = (seedOffset2.xy - 0.5) * TAU;

    float cs = cos(seedAngle);
    float sn = sin(seedAngle);
    p = mat2(cs, -sn, sn, cs) * p;

    float dither = getDither(floor(fragCoord / u_pixelRatio), u_ditherMode);

    float totalVal = 0.0;
    float totalWeight = 0.0;
    int turbIter = int(u_turbIter);

    float freq = 1.0 / max(u_turbFreq, 0.01);

    for (float i = 0.0; i < 4.0; i++) {
        float eph = i / 4.0;

        vec2 q = p * u_scale;
        float sq = eph * eph;

        if (u_jellify > 0.5) {
            q.yx *= mix(1.0, 0.5, 1.0 - exp(-sq));
        }

        float a = seedPhase.x;
        float d = seedPhase.y;

        for (int j = 2; j < 13; j++) {
            if (j >= turbIter) break;
            float fj = float(j);
            float t1 = mix(t * u_speed, tA, looping);
            float t2 = mix(t * u_speed, tB, looping);
            q += u_turbAmp * sin(q.yx / freq * fj + t1 + vec2(a, d) + seedOffset.xy * fj) / fj;
            a += cos(fj + d * 1.2 + q.x * 2.0 - t1 + seedOffset2.z + t2 * 0.3 * looping);
            d += sin(fj * q.y + a + seedOffset.z + t1 + seedOffset2.y + t2 * 0.3 * looping);
        }

        float v = 0.5 + 0.5 * sin(length(q.yx + vec2(a, d) * 0.2) * u_waveFreq + i * i + seedOffset.x);
        float weight = smoothstep(0.0, 0.5, eph) * smoothstep(1.0, 0.5, eph);
        totalVal += v * weight;
        totalWeight += weight;
    }

    float val = totalVal / totalWeight;
    val = clamp((val - 0.3) / 0.4, 0.0, 1.0);
    val = pow(val, exp(-u_distBias));
    val = clamp(val + (dither - 0.5) * u_dither, 0.0, 1.0);

    vec3 col = paletteN(val, colorCount);
    col *= u_exposure;
    col = applyContrastSaturation(col, u_contrast, u_saturation);
    col = softGamutMap(col);
    col = toSrgb(col);

    fragColor = vec4(col, 1.0);
}
`,W=8;function ze(s){if(!s||typeof s!="string")return[0,0,0,1];let a=s.trim().replace("#","");if(a.length===3&&(a=a.split("").map(h=>h+h).join("")),a.length!==6&&a.length!==8)return[0,0,0,1];const v=parseInt(a.substring(0,2),16)/255,n=parseInt(a.substring(2,4),16)/255,d=parseInt(a.substring(4,6),16)/255,m=a.length===8?parseInt(a.substring(6,8),16)/255:1;return[Number.isNaN(v)?0:v,Number.isNaN(n)?0:n,Number.isNaN(d)?0:d,Number.isNaN(m)?1:m]}function Me(s){return typeof s=="number"?s:s==="smooth"?1:s==="grain"?2:0}function Ne(s){const a=new Float32Array(W*4),v=s.length>0?s[s.length-1]:"#000000";for(let n=0;n<W;n++){const[d,m,h,F]=ze(n<s.length?s[n]:v);a[n*4+0]=d,a[n*4+1]=m,a[n*4+2]=h,a[n*4+3]=F}return a}const Ue=f.forwardRef(function(a,v){const{colors:n=o.colors,speed:d=o.speed,scale:m=o.scale,seed:h=o.seed,turbAmp:F=o.turbAmp,turbFreq:H=o.turbFreq,turbIter:Y=o.turbIter,waveFreq:Q=o.waveFreq,distBias:X=o.distBias,jellify:$=o.jellify,ditherMode:K=o.ditherMode,dither:J=o.dither,exposure:Z=o.exposure,contrast:ee=o.contrast,saturation:te=o.saturation,loop:re=o.loop,paused:I=!1,maxDpr:oe=2,fps:ae=0,respectReducedMotion:ne=!0,pauseWhenOffscreen:j=!0,pauseWhenHidden:S=!0,fallbackColor:we,onReady:le,onError:ie,className:Le,style:Fe,...Ie}=a,U=f.useRef(null),T=f.useRef(le),p=f.useRef(ie);T.current=le,p.current=ie;const g=f.useRef({colors:n,speed:d,scale:m,seed:h,turbAmp:F,turbFreq:H,turbIter:Y,waveFreq:Q,distBias:X,jellify:$,ditherMode:K,dither:J,exposure:Z,contrast:ee,saturation:te,loop:re,maxDpr:oe,fps:ae});g.current={colors:n,speed:d,scale:m,seed:h,turbAmp:F,turbFreq:H,turbIter:Y,waveFreq:Q,distBias:X,jellify:$,ditherMode:K,dither:J,exposure:Z,contrast:ee,saturation:te,loop:re,maxDpr:oe,fps:ae};const Se=n.join("|"),se=f.useMemo(()=>Ne(n),[Se]),ue=f.useRef(se);ue.current=se;const fe=Math.min(Math.max(n.length,1),W),ce=f.useRef(fe);ce.current=fe;const E=f.useRef(I);E.current=I;const b=f.useRef({play:()=>{},pause:()=>{}});return f.useImperativeHandle(v,()=>({get canvas(){return U.current},play:()=>b.current.play(),pause:()=>b.current.pause()}),[]),f.useEffect(()=>{I?b.current.pause():b.current.play()},[I]),f.useEffect(()=>{var ye,Re;const c=U.current;if(!c)return;const e=c.getContext("webgl2",{alpha:!0,premultipliedAlpha:!1,antialias:!1,powerPreference:"default",preserveDrawingBuffer:!1});if(!e){(ye=p.current)==null||ye.call(p,new Error("WebGL2 is not supported in this browser."));return}let u=null,x=null,q=null,B=null,r={},O=!1;function de(t,l){const i=e.createShader(l);if(!i)throw new Error("Could not create shader object.");if(e.shaderSource(i,t),e.compileShader(i),!e.getShaderParameter(i,e.COMPILE_STATUS)){const _=e.getShaderInfoLog(i);throw e.deleteShader(i),new Error(`Shader compile error: ${_}`)}return i}function me(){var t;try{const l=de(Be,e.VERTEX_SHADER),i=de(Oe,e.FRAGMENT_SHADER);if(u=e.createProgram(),!u)throw new Error("Could not create program.");if(e.attachShader(u,l),e.attachShader(u,i),e.linkProgram(u),e.deleteShader(l),e.deleteShader(i),!e.getProgramParameter(u,e.LINK_STATUS))throw new Error(`Shader linking failed: ${e.getProgramInfoLog(u)}`);e.useProgram(u),x=e.createVertexArray(),e.bindVertexArray(x),q=e.createBuffer(),e.bindBuffer(e.ARRAY_BUFFER,q),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),e.STATIC_DRAW);const _=e.getAttribLocation(u,"a_position");e.enableVertexAttribArray(_),e.vertexAttribPointer(_,2,e.FLOAT,!1,0,0),B=e.createBuffer(),e.bindBuffer(e.ARRAY_BUFFER,B),e.bufferData(e.ARRAY_BUFFER,new Float32Array([0,0,1,0,0,1,0,1,1,0,1,1]),e.STATIC_DRAW);const Ae=e.getAttribLocation(u,"a_texCoord");e.enableVertexAttribArray(Ae),e.vertexAttribPointer(Ae,2,e.FLOAT,!1,0,0);const Ee=["u_colors","u_colors_length","u_seed","u_speed","u_loop","u_scale","u_turbAmp","u_turbFreq","u_turbIter","u_waveFreq","u_distBias","u_jellify","u_ditherMode","u_dither","u_exposure","u_contrast","u_saturation","u_time","u_resolution","u_pixelRatio"];r={};for(const Ce of Ee)r[Ce]=e.getUniformLocation(u,Ce);return O=!0,!0}catch(l){return O=!1,(t=p.current)==null||t.call(p,l instanceof Error?l:new Error(String(l))),!1}}if(!me())return;let z=0,M=0,he=1;function D(){const t=Math.min(Math.max(g.current.maxDpr,.5),typeof window<"u"&&window.devicePixelRatio||1);he=t;const l=Math.max(1,Math.floor(c.clientWidth*t)),i=Math.max(1,Math.floor(c.clientHeight*t));return l!==z||i!==M?(z=l,M=i,c.width=l,c.height=i,e.viewport(0,0,l,i),!0):!1}D();let y=null;typeof ResizeObserver<"u"&&(y=new ResizeObserver(()=>{D()&&N()}),y.observe(c));function N(){if(!O||e.isContextLost())return;const t=g.current;e.useProgram(u),e.bindVertexArray(x),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.uniform4fv(r.u_colors,ue.current),e.uniform1i(r.u_colors_length,ce.current),e.uniform1f(r.u_seed,t.seed),e.uniform1f(r.u_speed,t.speed),e.uniform1f(r.u_loop,t.loop),e.uniform1f(r.u_scale,t.scale),e.uniform1f(r.u_turbAmp,t.turbAmp),e.uniform1f(r.u_turbFreq,t.turbFreq),e.uniform1f(r.u_turbIter,t.turbIter),e.uniform1f(r.u_waveFreq,t.waveFreq),e.uniform1f(r.u_distBias,t.distBias),e.uniform1f(r.u_jellify,t.jellify?1:0),e.uniform1f(r.u_ditherMode,Me(t.ditherMode)),e.uniform1f(r.u_dither,t.dither),e.uniform1f(r.u_exposure,t.exposure),e.uniform1f(r.u_contrast,t.contrast),e.uniform1f(r.u_saturation,t.saturation),e.uniform1f(r.u_time,pe),e.uniform2f(r.u_resolution,z,M),e.uniform1f(r.u_pixelRatio,he),e.drawArrays(e.TRIANGLES,0,6)}let R=0,k=!1,P=0,V=0,pe=0;const Te=ne&&typeof window<"u"&&typeof window.matchMedia=="function"&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;let G=!j,ve=!(S&&typeof document<"u"&&document.visibilityState==="hidden");function A(){return!E.current&&!Te&&G&&ve&&!e.isContextLost()}function be(t){if(!k)return;R=requestAnimationFrame(be);const l=g.current.fps,i=l>0?1e3/l:0;if(i>0&&t-V<i-1)return;const _=(t-P)/1e3;P=t,V=t,pe+=Math.min(_,.1)*g.current.speed,N()}function C(){k||!A()||(k=!0,P=typeof performance<"u"?performance.now():0,V=0,R=requestAnimationFrame(be))}function w(){k=!1,R&&cancelAnimationFrame(R),R=0}b.current={play:()=>{E.current=!1,C()},pause:()=>{E.current=!0,w()}};let L=null;j&&typeof IntersectionObserver<"u"?(L=new IntersectionObserver(t=>{G=t.some(l=>l.isIntersecting),A()?C():w()},{threshold:0}),L.observe(c)):G=!0;function _e(){ve=document.visibilityState!=="hidden",A()?C():w()}S&&typeof document<"u"&&document.addEventListener("visibilitychange",_e);function ge(t){t.preventDefault(),w(),O=!1}function xe(){me()&&(z=0,M=0,D(),A()?C():N())}return c.addEventListener("webglcontextlost",ge,!1),c.addEventListener("webglcontextrestored",xe,!1),(Re=T.current)==null||Re.call(T,e),A()?C():N(),()=>{w(),b.current={play:()=>{},pause:()=>{}},y==null||y.disconnect(),L==null||L.disconnect(),S&&typeof document<"u"&&document.removeEventListener("visibilitychange",_e),c.removeEventListener("webglcontextlost",ge),c.removeEventListener("webglcontextrestored",xe),q&&e.deleteBuffer(q),B&&e.deleteBuffer(B),x&&e.deleteVertexArray(x),u&&e.deleteProgram(u)}},[j,S,ne]),qe.jsx("canvas",{ref:U,className:Le,style:{display:"block",width:"100%",height:"100%",touchAction:"none",backgroundColor:we??n[0]??"#000",...Fe},...Ie})});export{o as LIQUID_GRADIENT_DEFAULTS,je as LIQUID_GRADIENT_PRESETS,Ue as LiquidGradientCanvas,Ue as default};
