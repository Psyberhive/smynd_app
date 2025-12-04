import React, { useState, useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { OrbitControls, Center } from "@react-three/drei";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

// --- I18N CONTENT ---
type Lang = "fa" | "en";
type Theme = "dark" | "light";

const TRANSLATIONS = {
  fa: {
    dir: "rtl",
    font: "Vazirmatn",
    signIn: "ورود",
    signUp: "ثبت‌نام",
    heroTitle: "هیچ‌کس مثل تو نیست.",
    heroSubtitle: "نسخه‌ای از خودت بساز که همراهت در آینده باشد.",
    introText: (
      <>
        با شرکت در آزمایش‌ها و تکمیل پرسشنامه‌ها، یک{" "}
        <span className="text-blue-500 dark:text-blue-400 font-bold">
          Second Mind
        </span>{" "}
        از خودت می‌سازی؛ نسخه‌ای دیجیتال که از داده‌های واقعی تو ساخته شده و
        می‌تواند در دنیای دیجیتال برای رفاه و شادی آینده‌ات کنار تو باشد.
      </>
    ),
    howItWorksTitle: "چطور کار می‌کند؟",
    howItWorksDesc:
      "SMynd پلی است بین پژوهشگران و کسانی که می‌خواهند هم به علم کمک کنند، هم خودشان را بهتر بشناسند و هم یک نسخهٔ دیجیتال از ذهن‌شان بسازند.",
    steps: [
      {
        step: "۱",
        title: "در پژوهش‌ها شرکت کن",
        desc: "ثبت‌نام می‌کنی، آزمایش‌ها و پرسشنامه‌های فعال را می‌بینی و آن‌هایی که به تو می‌خورند انتخاب می‌کنی.",
      },
      {
        step: "۲",
        title: "Second Mind خودت را می‌سازی",
        desc: "با هر پاسخ دقیق و هر تصمیم آگاهانه، لایه‌ای تازه به نسخهٔ دیجیتالِ شبیه خودت اضافه می‌شود.",
      },
      {
        step: "۳",
        title: "امتیاز می‌گیری و آینده‌ات را می‌سازی",
        desc: "امتیازهایی که می‌گیری، هم به‌سمت تبدیل به کریپتوکارنسی واقعی حرکت می‌کنند، و هم Second Mind تو را قوی‌تر می‌کنند.",
      },
    ],
    whatIsTitle: "Second Mind چیست؟",
    whatIsP1:
      "Second Mind فقط یک مدل هوش مصنوعی نیست؛ نسخه‌ای دیجیتال، پویا و شبیه توست که از روی رفتارها، ترجیح‌ها و الگوهای تصمیم‌گیری واقعی‌ات ساخته می‌شود. هر بار که با دقت در یک آزمایش شرکت می‌کنی یا پرسشنامه‌ای را با حوصله پر می‌کنی، این نسخه دقیق‌تر و شبیه‌تر به تو می‌شود.",
    whatIsP2:
      "Second Mind می‌تواند در آینده در دنیای دیجیتال به جای تو تعامل کند، گزینه‌ها را برایت فیلتر کند، محصولات و تجربه‌هایی مطابق سلیقه‌ات پیشنهاد دهد و حتی در انتخاب شریک یا سبک زندگی مناسب، کنار تو باشد.",
    whatIsQuote:
      "این یک نسخهٔ فانتزی و جادویی نیست؛ بلکه موجودی داده‌محور و یادگیرنده است که بر اساس انتخاب‌های واقعی تو شکل می‌گیرد.",
    qualityTitle: "کیفیت پاسخ‌ها، کلید امتیاز و کریپتو در آینده",
    qualityDesc:
      "در SMynd، امتیازهایی که به‌تدریج جمع می‌کنی—و در آینده قابلیت تبدیل شدن به کریپتوکارنسی واقعی را خواهند داشت—مستقیماً به دقت، تمرکز و کیفیت مشارکت تو در پژوهش‌ها وابسته‌اند.",
    qualityPoints: [
      "تو امتیاز بیشتری دریافت می‌کنی",
      "پژوهشگر هم به‌خاطر استفاده از دادهٔ معتبر، پاداش مربوط به پژوهش را می‌گیرد",
      "و امتیازهایت در مسیر تبدیل شدن به ارزش واقعی روی بلاکچین حرکت می‌کنند",
    ],
    collabTitle: "ساختن Second Mind؛ یک تجربهٔ مشارکتی",
    collabDesc:
      "Second Mind تنها توسط الگوریتم‌ها ساخته نمی‌شود؛ این یک تجربهٔ مشارکتی بین تو و پژوهشگران است. تو با حضور ذهن و صداقت در پرسشنامه‌ها شرکت می‌کنی و آن‌ها با سنجش کیفیت داده‌ها، داده‌های خوب را از داده‌های بی‌کیفیت جدا می‌کنند و به داده‌های معتبر امتیاز می‌دهند.",
    welfareTitle: "رفاه مادی و رفاه شخصی، در کنار هم",
    welfareDesc:
      "مشارکت در SMynd هم رفاه مادی به همراه دارد، و هم به‌تدریج یک نسخه از تو را می‌سازد که به خودت برای رسیدن به رفاه بیشتر کمک می‌کند. یک موجود دیجیتال شبیه تو که می‌تواند در دنیای مجازی و هوشمند آینده به زندگی‌ات معنا و جهت بدهد.",
    ctaTitle: "آماده‌ای Second Mind خودت را بسازی؟",
    ctaDesc:
      "اگر می‌خواهی جزو اولین کسانی باشی که نسخهٔ دیجیتال از ذهن خودشان را می‌سازند، می‌توانی ایمیل‌ات را وارد کنی تا وقتی پژوهش‌ها و پاداش‌ها فعال شدند، به تو خبر بدهیم.",
    emailPlaceholder: "ایمیل خود را وارد کنید",
    submitBtn: "ثبت‌نام",
    footerCopyright: "© ۲۰۲۴ پروژه SMynd. تمامی حقوق محفوظ است.",
    uiPrompt: "برای ساختن کلیک کنید",
    socialTitle: "ما را دنبال کنید",
  },
  en: {
    dir: "ltr",
    font: "sans-serif",
    signIn: "Sign In",
    signUp: "Sign Up",
    heroTitle: "There is no one like you.",
    heroSubtitle: "Build a version of yourself to accompany you in the future.",
    introText: (
      <>
        By participating in experiments and completing questionnaires, you build
        a{" "}
        <span className="text-blue-500 dark:text-blue-400 font-bold">
          Second Mind
        </span>
        ; a digital version created from your real data that can be with you in
        the digital world for your future well-being and happiness.
      </>
    ),
    howItWorksTitle: "How does it work?",
    howItWorksDesc:
      "SMynd is a bridge between researchers and those who want to contribute to science, understand themselves better, and build a digital version of their mind.",
    steps: [
      {
        step: "1",
        title: "Participate in Research",
        desc: "Sign up, view active experiments and questionnaires, and choose the ones that suit you.",
      },
      {
        step: "2",
        title: "Build Your Second Mind",
        desc: "With every accurate answer and conscious decision, a new layer is added to your digital twin.",
      },
      {
        step: "3",
        title: "Earn Points & Build Future",
        desc: "The points you earn move towards becoming real cryptocurrency and make your Second Mind stronger.",
      },
    ],
    whatIsTitle: "What is Second Mind?",
    whatIsP1:
      "Second Mind is not just an AI model; it is a dynamic digital version of you, built from your real behaviors, preferences, and decision-making patterns. Every time you participate in an experiment with care or patiently fill out a questionnaire, this version becomes more accurate and more like you.",
    whatIsP2:
      "In the future, Second Mind can interact on your behalf in the digital world, filter options for you, suggest products and experiences tailored to your taste, and even support you in choosing a partner or suitable lifestyle.",
    whatIsQuote:
      "This is not a fantasy or magical version; it is a data-driven and learning entity formed based on your real choices.",
    qualityTitle: "Answer Quality: The Key to Points and Future Crypto",
    qualityDesc:
      "In SMynd, the points you gradually accumulate—which will have the potential to become real cryptocurrency in the future—depend directly on the accuracy, focus, and quality of your participation in research.",
    qualityPoints: [
      "You receive more points",
      "The researcher receives their reward for using valid data",
      "Your points move towards becoming real value on the blockchain",
    ],
    collabTitle: "Building Second Mind: A Collaborative Experience",
    collabDesc:
      "Second Mind is not built by algorithms alone; it is a collaborative experience between you and researchers. You participate in questionnaires with presence of mind and honesty, and they assess data quality, separating good data from poor data and rewarding valid data.",
    welfareTitle: "Material Wealth and Personal Well-being, Together",
    welfareDesc:
      "Participating in SMynd brings material wealth and gradually builds a version of you that helps you achieve greater well-being. A digital entity like you that can give meaning and direction to your life in the future virtual and intelligent world.",
    ctaTitle: "Ready to build your Second Mind?",
    ctaDesc:
      "If you want to be among the first to build a digital version of your mind, enter your email so we can notify you when research and rewards become active.",
    emailPlaceholder: "Enter your email",
    submitBtn: "Sign Up",
    footerCopyright: "© 2024 SMynd Project. All rights reserved.",
    uiPrompt: "Click to synthesize",
    socialTitle: "Follow Us",
  },
};

// --- CONFIGURATION ---
const CONFIG = {
  colors: {
    // Dark Mode Colors
    dark: {
      initial: new THREE.Color("#88ccff"), // Light Blue
      new: new THREE.Color("#ffff00"), // Yellow
      spark: new THREE.Color("#ffffff"), // White
      trail: new THREE.Color("#ffcc00"), // Gold/Yellow
    },
    // Light Mode Colors (Darker for visibility on white background)
    light: {
      initial: new THREE.Color("#0066cc"), // Deep Blue
      new: new THREE.Color("#e6ac00"), // Deep Gold/Orange
      spark: new THREE.Color("#000000"), // Dark spark for contrast
      trail: new THREE.Color("#ff8800"), // Orange
    },
  },
  points: {
    initialCount: 6000,
    maxCount: 20000,
    size: 0.035,
    sizeSpark: 0.15, // Increased spark size
    hoverScale: 2.5,
    hoverRadius: 0.6,
  },
  physics: {
    flySpeed: 0.08,
    curvatureBias: 2.5,
  },
  ripple: {
    strength: 0.15,
    speed: 0.2,
    decay: 0.92,
    radius: 1.5,
  },
  startup: {
    duration: 1.2,
  },
  defaultModel: "/images/female_face_low.obj",
};

// --- TYPES ---
type Particle = {
  currentPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  color: THREE.Color;
  active: boolean;
  phase: "flying" | "landed" | "trail";
  landTime: number;
  life: number;
  isInitial: boolean;
};

// --- UTILS ---
const sampleMeshSurface = (
  geometry: THREE.BufferGeometry,
  count: number
): Float32Array => {
  const positions = geometry.attributes.position;
  const faces = positions.count / 3;

  const weights: number[] = [];
  const cumulativeWeights: number[] = [];
  let totalWeight = 0;

  const _vA = new THREE.Vector3();
  const _vB = new THREE.Vector3();
  const _vC = new THREE.Vector3();
  const _center = new THREE.Vector3();

  geometry.computeBoundingBox();
  const centerOfMesh = new THREE.Vector3();
  if (geometry.boundingBox) {
    geometry.boundingBox.getCenter(centerOfMesh);
  }

  for (let i = 0; i < faces; i++) {
    _vA.fromBufferAttribute(positions, i * 3 + 0);
    _vB.fromBufferAttribute(positions, i * 3 + 1);
    _vC.fromBufferAttribute(positions, i * 3 + 2);

    const _cross = new THREE.Vector3()
      .subVectors(_vB, _vA)
      .cross(new THREE.Vector3().subVectors(_vC, _vA));
    let area = _cross.length() * 0.5;

    _center
      .addVectors(_vA, _vB)
      .add(_vC)
      .multiplyScalar(1 / 3);
    const dist = _center.distanceTo(centerOfMesh);

    const centralBias = 1 / (dist + 0.1);
    const weight = area * Math.pow(centralBias, CONFIG.physics.curvatureBias);

    weights.push(weight);
    totalWeight += weight;
    cumulativeWeights.push(totalWeight);
  }

  const result = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const r = Math.random() * totalWeight;

    let lower = 0;
    let upper = cumulativeWeights.length - 1;
    let faceIndex = 0;

    while (lower <= upper) {
      const mid = Math.floor((lower + upper) / 2);
      if (r < cumulativeWeights[mid]) {
        upper = mid - 1;
        faceIndex = mid;
      } else {
        lower = mid + 1;
      }
    }

    _vA.fromBufferAttribute(positions, faceIndex * 3 + 0);
    _vB.fromBufferAttribute(positions, faceIndex * 3 + 1);
    _vC.fromBufferAttribute(positions, faceIndex * 3 + 2);

    const r1 = Math.random();
    const r2 = Math.random();
    const sqrtR1 = Math.sqrt(r1);
    const u = 1 - sqrtR1;
    const v = sqrtR1 * (1 - r2);
    const w = sqrtR1 * r2;

    result[i * 3 + 0] = u * _vA.x + v * _vB.x + w * _vC.x;
    result[i * 3 + 1] = u * _vA.y + v * _vB.y + w * _vC.y;
    result[i * 3 + 2] = u * _vA.z + v * _vB.z + w * _vC.z;
  }

  return result;
};

// --- SHADERS ---
const pointVertexShader = `
  attribute float size;
  attribute vec3 color;
  attribute float isFlying;
  attribute float opacity;
  varying vec3 vColor;
  varying float vIsFlying;
  varying float vOpacity;
  uniform float uPixelRatio;

  void main() {
    vColor = color;
    vIsFlying = isFlying;
    
    // Vertical fade logic
    // The geometry is centered and scaled to approx radius 3.5
    // We fade out the bottom part (neck/chin area) smoothly
    float fadeBottom = smoothstep(-3.0, -0.5, position.y);
    vOpacity = opacity * fadeBottom;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    
    // Scale size by pixel ratio for consistent look across devices (mobile/desktop)
    // Boost size if flying for visibility
    float sizeBoost = isFlying > 0.5 ? 2.5 : 1.0;
    gl_PointSize = size * sizeBoost * uPixelRatio * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const pointFragmentShader = `
  varying vec3 vColor;
  varying float vIsFlying;
  varying float vOpacity;
  void main() {
    if (vOpacity < 0.01) discard;

    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    float r = dot(cxy, cxy);
    
    float alpha = 0.0;
    
    if (vIsFlying > 0.5) {
        // Flying shape: Sharp Diamond Star with White Core
        float d = abs(cxy.x) + abs(cxy.y);
        
        // Inner white hot core
        float core = 1.0 - smoothstep(0.0, 0.2, d);
        
        // Outer colored glow
        float glow = 1.0 - smoothstep(0.2, 0.8, d);
        
        alpha = core + glow * 0.8;
        
        // Mix white core with color
        vec3 finalColor = mix(vColor * 4.0, vec3(1.0), core);
        gl_FragColor = vec4(finalColor, alpha * vOpacity);
    } else {
        // Landed shape: Soft Circle
        if (r > 1.0) discard;
        alpha = 1.0 - smoothstep(0.5, 1.0, r);
        gl_FragColor = vec4(vColor, alpha * vOpacity);
    }
  }
`;

// --- BACKGROUND PARTICLES ---
const BackgroundParticles: React.FC<{ theme: Theme }> = ({ theme }) => {
  const count = 400;
  const meshRef = useRef<THREE.Points>(null);
  const { viewport } = useThree();

  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = 10 + Math.random() * 20; // Distant shell
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      temp[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      temp[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      temp[i * 3 + 2] = r * Math.cos(phi);
      sizes[i] = Math.random() * 0.5 + 0.1;
    }
    return { positions: temp, sizes };
  }, []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Slow rotation for ambient feel
      meshRef.current.rotation.y += delta * 0.02;
      meshRef.current.rotation.x += delta * 0.005;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={particles.sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        sizeAttenuation={true}
        color={theme === "dark" ? "#5588aa" : "#334455"}
        transparent={true}
        opacity={theme === "dark" ? 0.6 : 0.3}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

interface PointCloudProps {
  geometry: THREE.BufferGeometry;
  theme: Theme;
}

const PointCloud: React.FC<PointCloudProps> = ({ geometry, theme }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  const particles = useRef<Particle[]>([]);
  const shockwaves = useRef<
    { center: THREE.Vector3; time: number; strength: number }[]
  >([]);
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0));
  const startupTime = useRef<number | null>(null);

  const { camera, gl } = useThree();

  // Get colors based on theme
  const themeColors = useMemo(() => CONFIG.colors[theme], [theme]);

  // Update material blending based on theme
  useEffect(() => {
    if (pointsRef.current) {
      const material = pointsRef.current.material as THREE.ShaderMaterial;
      material.blending =
        theme === "dark" ? THREE.AdditiveBlending : THREE.NormalBlending;
      material.uniforms.uPixelRatio.value = gl.getPixelRatio();
      material.needsUpdate = true;
    }
  }, [theme, gl]);

  useEffect(() => {
    if (!geometry) return;

    particles.current = [];
    shockwaves.current = [];
    startupTime.current = null;

    const sampledPositions = sampleMeshSurface(
      geometry,
      CONFIG.points.maxCount
    );
    const initialParticles: Particle[] = [];

    // We use the current theme colors for initial setup
    const initialColor = themeColors.initial;
    const newColor = themeColors.new;

    for (let i = 0; i < CONFIG.points.maxCount; i++) {
      const tx = sampledPositions[i * 3];
      const ty = sampledPositions[i * 3 + 1];
      const tz = sampledPositions[i * 3 + 2];
      const target = new THREE.Vector3(tx, ty, tz);

      const isActive = i < CONFIG.points.initialCount;
      const isInitial = isActive;

      initialParticles.push({
        currentPos: isActive ? target.clone() : new THREE.Vector3(0, 0, 0),
        targetPos: target,
        color: isInitial ? initialColor.clone() : newColor.clone(),
        active: isActive,
        phase: "landed",
        landTime: 0,
        life: 1.0,
        isInitial: isInitial,
      });
    }

    particles.current = initialParticles;

    if (pointsRef.current) {
      const positions = new Float32Array(CONFIG.points.maxCount * 3);
      const colors = new Float32Array(CONFIG.points.maxCount * 3);
      const sizes = new Float32Array(CONFIG.points.maxCount);
      const isFlying = new Float32Array(CONFIG.points.maxCount);
      const opacity = new Float32Array(CONFIG.points.maxCount);

      for (let i = 0; i < CONFIG.points.maxCount; i++) {
        const p = initialParticles[i];
        if (p.active) {
          positions[i * 3] = p.currentPos.x;
          positions[i * 3 + 1] = p.currentPos.y;
          positions[i * 3 + 2] = p.currentPos.z;
          colors[i * 3] = p.color.r;
          colors[i * 3 + 1] = p.color.g;
          colors[i * 3 + 2] = p.color.b;
          sizes[i] = CONFIG.points.size;
          isFlying[i] = 0.0;
          opacity[i] = 1.0;
        } else {
          positions[i * 3] = 99999;
          sizes[i] = 0;
          isFlying[i] = 0.0;
          opacity[i] = 0.0;
        }
      }

      pointsRef.current.geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );
      pointsRef.current.geometry.setAttribute(
        "color",
        new THREE.BufferAttribute(colors, 3)
      );
      pointsRef.current.geometry.setAttribute(
        "size",
        new THREE.BufferAttribute(sizes, 1)
      );
      pointsRef.current.geometry.setAttribute(
        "isFlying",
        new THREE.BufferAttribute(isFlying, 1)
      );
      pointsRef.current.geometry.setAttribute(
        "opacity",
        new THREE.BufferAttribute(opacity, 1)
      );
    }
  }, [geometry, themeColors]);

  const spawnSinglePoint = (x: number, y: number) => {
    if (!particles.current.length) return;

    mouse.current.x = (x / window.innerWidth) * 2 - 1;
    mouse.current.y = -(y / window.innerHeight) * 2 + 1;

    raycaster.current.setFromCamera(mouse.current, camera);
    const targetV = new THREE.Vector3();
    raycaster.current.ray.intersectPlane(plane.current, targetV);

    const nextIdx = particles.current.findIndex((p) => !p.active);
    if (nextIdx !== -1) {
      const p = particles.current[nextIdx];

      p.currentPos.copy(targetV);
      p.active = true;
      p.phase = "flying";
      p.color.copy(themeColors.new);
      p.isInitial = false;
      p.life = 1.0;
    }
  };

  useEffect(() => {
    // We use pointerdown to handle both mouse and touch events
    const handlePointerDown = (e: PointerEvent) => {
      if (e.isPrimary) {
        spawnSinglePoint(e.clientX, e.clientY);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [camera, themeColors]);

  useFrame((state, delta) => {
    if (!pointsRef.current || particles.current.length === 0) return;

    if (startupTime.current === null) {
      startupTime.current = state.clock.elapsedTime;
    }

    const timeSinceStartup = state.clock.elapsedTime - startupTime.current;
    const positions = pointsRef.current.geometry.attributes
      .position as THREE.BufferAttribute;
    const colors = pointsRef.current.geometry.attributes
      .color as THREE.BufferAttribute;
    const sizes = pointsRef.current.geometry.attributes
      .size as THREE.BufferAttribute;
    const isFlyingAttr = pointsRef.current.geometry.attributes
      .isFlying as THREE.BufferAttribute;
    const opacityAttr = pointsRef.current.geometry.attributes
      .opacity as THREE.BufferAttribute;

    raycaster.current.setFromCamera(mouse.current, camera);
    let hoverPos: THREE.Vector3 | null = null;
    if (meshRef.current) {
      const intersects = raycaster.current.intersectObject(meshRef.current);
      if (intersects.length > 0) {
        hoverPos = intersects[0].point;
      }
    }

    shockwaves.current.forEach((s) => {
      s.time += delta * CONFIG.ripple.speed;
    });
    shockwaves.current = shockwaves.current.filter((s) => s.time < 1.0);

    const scratchV = new THREE.Vector3();

    // Loop through all particles
    for (let i = 0; i < particles.current.length; i++) {
      const p = particles.current[i];
      if (!p.active) continue;

      // --- TRAIL LOGIC ---
      if (p.phase === "flying") {
        if (state.clock.getElapsedTime() % 0.05 < 0.02) {
          for (let t = particles.current.length - 1; t >= 0; t--) {
            if (!particles.current[t].active) {
              const trailP = particles.current[t];
              trailP.active = true;
              trailP.phase = "trail";
              trailP.life = 1.0;
              trailP.currentPos.copy(p.currentPos);
              trailP.color.copy(themeColors.trail);
              break;
            }
          }
        }
      }

      // --- PHASE UPDATE ---
      if (p.phase === "flying") {
        const dist = p.currentPos.distanceTo(p.targetPos);
        p.currentPos.lerp(p.targetPos, CONFIG.physics.flySpeed);

        isFlyingAttr.setX(i, 1.0);
        opacityAttr.setX(i, 1.0);

        if (dist < 0.1) {
          p.phase = "landed";
          p.currentPos.copy(p.targetPos);
          p.landTime = state.clock.elapsedTime;

          shockwaves.current.push({
            center: p.targetPos.clone(),
            time: 0,
            strength: CONFIG.ripple.strength,
          });
        }
      } else if (p.phase === "trail") {
        p.life -= delta * 2.0;
        if (p.life <= 0) {
          p.active = false;
          positions.setXYZ(i, 99999, 99999, 99999);
          opacityAttr.setX(i, 0.0);
          continue;
        }
        opacityAttr.setX(i, p.life * 0.6);
        isFlyingAttr.setX(i, 0.0);
      } else {
        // Landed
        isFlyingAttr.setX(i, 0.0);
        opacityAttr.setX(i, 1.0);
      }

      // --- SIZE & COLOR ---
      let size = CONFIG.points.size;

      // Base color override based on current theme to allow live switching
      const targetBaseColor = p.isInitial
        ? themeColors.initial
        : themeColors.new;

      if (p.phase === "trail") {
        size = CONFIG.points.size * 0.8 * p.life;
        p.color.lerp(themeColors.trail, 0.2); // Gradually adjust to theme trail
      } else {
        // Slowly lerp towards the correct theme color (handles mode switching)
        p.color.lerp(targetBaseColor, 0.1);
      }

      // Landing Spark Effect
      if (!p.isInitial && p.phase === "landed") {
        const timeSinceLand = state.clock.elapsedTime - p.landTime;
        if (timeSinceLand < 0.6) {
          const sparkIntensity = Math.pow((0.6 - timeSinceLand) * 1.66, 2);
          p.color.lerp(themeColors.spark, sparkIntensity);
          size += sparkIntensity * 0.15;
        }
      }

      // Flying Spark Visuals
      if (p.phase === "flying") {
        size = CONFIG.points.sizeSpark * 2.5; // Bold fly size
        p.color.lerp(themeColors.spark, 0.8);
      }

      // Startup Animation
      if (p.isInitial && timeSinceStartup < CONFIG.startup.duration) {
        const progress = timeSinceStartup / CONFIG.startup.duration;
        const pulse = Math.sin(progress * Math.PI);
        p.color.lerp(themeColors.spark, pulse * 0.5);
        size += pulse * 0.04;
      }

      // Hover Effect
      if (hoverPos && p.phase === "landed") {
        const d = p.currentPos.distanceTo(hoverPos);
        if (d < CONFIG.points.hoverRadius) {
          const hoverFactor = 1.0 - d / CONFIG.points.hoverRadius;
          const scale =
            1.0 + hoverFactor * hoverFactor * (CONFIG.points.hoverScale - 1.0);
          size *= scale;
          p.color.lerp(themeColors.spark, hoverFactor * 0.3);
        }
      }

      scratchV.copy(p.currentPos);

      if (p.phase === "landed") {
        let shockColorIntensity = 0;

        for (const sw of shockwaves.current) {
          const d = scratchV.distanceTo(sw.center);
          if (d < CONFIG.ripple.radius) {
            // Physical displacement wave
            const wave =
              Math.sin(d * 10 - sw.time * 20) * Math.max(0, 1 - sw.time);
            const distFactor = Math.max(0, 1 - d / CONFIG.ripple.radius);
            const displacementAmount = wave * sw.strength * distFactor;

            const dir = new THREE.Vector3()
              .subVectors(scratchV, sw.center)
              .normalize();
            scratchV.add(dir.multiplyScalar(displacementAmount));

            // --- GRADIENT COLOR LOGIC ---
            const gradientCurve = Math.pow(distFactor, 0.8);
            const timeFade = Math.max(0, 1.0 - sw.time);
            const intensity = gradientCurve * timeFade;

            shockColorIntensity = Math.max(shockColorIntensity, intensity);
          }
        }

        // Apply color gradient if affected by shockwave
        if (shockColorIntensity > 0.001) {
          p.color.lerp(themeColors.new, shockColorIntensity * 0.9);
        }
      }

      positions.setXYZ(i, scratchV.x, scratchV.y, scratchV.z);
      colors.setXYZ(i, p.color.r, p.color.g, p.color.b);
      sizes.setX(i, size);
    }

    positions.needsUpdate = true;
    colors.needsUpdate = true;
    sizes.needsUpdate = true;
    isFlyingAttr.needsUpdate = true;
    opacityAttr.needsUpdate = true;
  });

  return (
    <group>
      {geometry && (
        <mesh ref={meshRef} geometry={geometry} visible={false}>
          <meshBasicMaterial />
        </mesh>
      )}
      <points ref={pointsRef} frustumCulled={false}>
        <bufferGeometry />
        <shaderMaterial
          vertexShader={pointVertexShader}
          fragmentShader={pointFragmentShader}
          transparent={true}
          depthWrite={false}
          uniforms={{
            uPixelRatio: { value: 1.0 }, // Initial value, updated in useEffect
          }}
        />
      </points>
    </group>
  );
};

const ModelLoader: React.FC<{
  url: string;
  onLoad: (geo: THREE.BufferGeometry) => void;
}> = ({ url, onLoad }) => {
  const obj = useLoader(OBJLoader, url) as THREE.Group;

  useEffect(() => {
    if (obj) {
      let geometry: THREE.BufferGeometry | null = null;
      obj.traverse((child) => {
        if ((child as THREE.Mesh).isMesh && !geometry) {
          geometry = (child as THREE.Mesh).geometry;
        }
      });
      if (geometry) onLoad(geometry);
    }
  }, [obj, onLoad]);

  return null;
};

// Component to handle camera responsiveness
const ResponsiveRig = () => {
  const { camera, size } = useThree();

  useEffect(() => {
    const isMobile = size.width < 640;
    const isTablet = size.width >= 640 && size.width < 1024;

    let targetZ = 6;
    if (isMobile) targetZ = 9; // Move camera back on mobile to fit the face
    else if (isTablet) targetZ = 7.5;

    camera.position.z = targetZ;
    camera.updateProjectionMatrix();
  }, [camera, size]);

  return null;
};

const NeuroFaceVisualizer: React.FC<{ uiPrompt: string; theme: Theme }> = ({
  uiPrompt,
  theme,
}) => {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  const handleGeomLoaded = (geo: THREE.BufferGeometry) => {
    geo.computeBoundingSphere();
    const center = geo.boundingSphere!.center;
    const radius = geo.boundingSphere!.radius;

    const scale = 3.5 / radius;
    geo.translate(-center.x, -center.y, -center.z);
    geo.scale(scale, scale, scale);

    setGeometry(geo);
  };

  return (
    <div className="absolute inset-0 w-full h-full z-0">
      <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
        {/* Dynamic Background Color based on Theme */}
        <color
          attach="background"
          args={[theme === "dark" ? "#000000" : "#f0f4f8"]}
        />

        {/* Subtle Background Particles */}
        <BackgroundParticles theme={theme} />

        <ambientLight intensity={0.5} />

        <Center>
          {geometry && <PointCloud geometry={geometry} theme={theme} />}
        </Center>

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minDistance={4}
          maxDistance={12}
          minPolarAngle={Math.PI / 2} // Lock vertical to horizon
          maxPolarAngle={Math.PI / 2} // Lock vertical to horizon
          autoRotate={true}
          autoRotateSpeed={0.5}
        />

        <ResponsiveRig />

        <React.Suspense fallback={null}>
          <ModelLoader url={CONFIG.defaultModel} onLoad={handleGeomLoaded} />
        </React.Suspense>
      </Canvas>

      <div
        className={`absolute bottom-6 left-6 pointer-events-none text-xs font-mono select-none transition-colors ${
          theme === "dark" ? "text-white/30" : "text-slate-500"
        }`}
        style={{ direction: "ltr" }}
      >
        <p>Interactive NeuroMesh v1.0</p>
        <p>{uiPrompt}</p>
      </div>
    </div>
  );
};

// --- LANDING PAGE ---
const App: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const apiBase =
    import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "";

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setErrorMsg(
        lang === "fa"
          ? "لطفاً ایمیل خود را وارد کنید."
          : "Please enter your email."
      );
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `${apiBase.replace(/\/$/, "")}/newsletter/subscribe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: trimmed }),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const detail = (data && (data.detail || data.message)) || "";
        throw new Error(detail || "Request failed");
      }

      setSuccessMsg(
        lang === "fa"
          ? "ایمیل شما در خبرنامه ثبت شد. لطفاً ایمیل خود را چک کنید."
          : "You have been subscribed to the newsletter. Please check your email."
      );
      setEmail("");
    } catch (err: any) {
      setErrorMsg(
        lang === "fa"
          ? "در ثبت ایمیل مشکلی پیش آمد. بعداً دوباره تلاش کنید."
          : "There was a problem subscribing. Please try again later."
      );
      console.error("newsletter subscribe error:", err);
    } finally {
      setLoading(false);
    }
  };

  const [lang, setLang] = useState<Lang>("fa");
  const [theme, setTheme] = useState<Theme>("dark");
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.body.dir = t.dir;
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [lang, t.dir, theme]);

  const toggleLang = () => {
    setLang((prev) => (prev === "fa" ? "en" : "fa"));
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 font-sans selection:bg-yellow-500/30 ${
        lang === "fa" ? "font-vazir" : "font-sans"
      } ${
        theme === "dark"
          ? "bg-black text-gray-100"
          : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* Header / Nav */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 p-4 md:p-6 flex justify-between items-center transition-colors ${
          theme === "dark"
            ? "bg-black/80"
            : "bg-white/80 border-b border-gray-200"
        } backdrop-blur-md`}
      >
        <div
          className={`flex gap-2 sm:gap-3 items-center ${
            lang === "fa" ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <a
            href={`/#/${lang}/auth/sign-in`}
            className={`px-2 py-1.5 md:px-4 md:py-2 rounded-lg transition-all text-xs md:text-sm font-bold border border-transparent whitespace-nowrap ${
              theme === "dark"
                ? "text-white/80 hover:text-white hover:bg-white/10 hover:border-white/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-300"
            }`}
          >
            {t.signIn}
          </a>
          <a
            href={`/#/${lang}/auth/sign-up`}
            className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition-all text-xs md:text-sm font-bold shadow-lg shadow-blue-500/20 whitespace-nowrap"
          >
            {t.signUp}
          </a>
        </div>

        <div className="flex gap-2 md:gap-4 items-center">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-1.5 md:p-2 rounded-full transition-all border ${
              theme === "dark"
                ? "border-gray-700 bg-gray-800 text-yellow-400 hover:bg-gray-700"
                : "border-gray-200 bg-white text-slate-600 hover:bg-slate-100"
            }`}
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <svg
                className="w-4 h-4 md:w-5 md:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 md:w-5 md:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>

          {/* Lang Toggle */}
          <button
            onClick={toggleLang}
            className={`px-2 py-1.5 md:px-4 md:py-2 rounded-lg transition-all text-xs md:text-sm font-bold uppercase border ${
              theme === "dark"
                ? "bg-gray-800/50 border-gray-700 hover:border-blue-500 text-white"
                : "bg-white border-gray-200 hover:border-blue-500 text-slate-700"
            }`}
          >
            {lang === "fa" ? "En" : "فا"}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        {/* Background Visualizer */}
        <NeuroFaceVisualizer uiPrompt={t.uiPrompt} theme={theme} />

        {/* Hero Overlay Content */}
        <div className="relative z-10 text-center px-4 w-full max-w-4xl pointer-events-none select-none mt-16 md:mt-20">
          <h1
            className={`text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6 leading-tight text-transparent bg-clip-text ${
              theme === "dark"
                ? "bg-gradient-to-r from-blue-300 via-white to-blue-300 drop-shadow-[0_0_15px_rgba(136,204,255,0.5)]"
                : "bg-gradient-to-r from-blue-600 via-slate-800 to-blue-600 drop-shadow-sm"
            }`}
          >
            {t.heroTitle}
          </h1>
          <p
            className={`text-base sm:text-lg md:text-2xl font-light leading-relaxed max-w-xl md:max-w-2xl mx-auto px-4 ${
              theme === "dark" ? "text-blue-100/90" : "text-slate-600"
            }`}
          >
            {t.heroSubtitle}
          </p>

          <div
            className={`mt-8 md:mt-16 pointer-events-auto animate-bounce opacity-50 ${
              theme === "dark" ? "text-white" : "text-slate-800"
            }`}
          >
            <svg
              className="w-5 h-5 md:w-6 md:h-6 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>

        <div
          className={`absolute bottom-0 w-full h-24 md:h-32 bg-gradient-to-t pointer-events-none z-10 ${
            theme === "dark"
              ? "from-black to-transparent"
              : "from-slate-50 to-transparent"
          }`}
        ></div>
      </section>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-12 space-y-16 md:space-y-24">
        {/* Intro Section */}
        <section className="text-center space-y-6">
          <p
            className={`text-base md:text-lg leading-7 md:leading-8 ${
              theme === "dark" ? "text-gray-300" : "text-slate-600"
            }`}
          >
            {t.introText}
          </p>
        </section>

        {/* How it works */}
        <section>
          <h2
            className={`text-2xl md:text-3xl font-bold mb-8 md:mb-10 text-center border-b pb-4 ${
              theme === "dark"
                ? "text-white border-gray-800"
                : "text-slate-900 border-slate-200"
            }`}
          >
            {t.howItWorksTitle}
          </h2>
          <p
            className={`text-center mb-10 md:mb-12 text-sm md:text-base ${
              theme === "dark" ? "text-gray-400" : "text-slate-500"
            }`}
          >
            {t.howItWorksDesc}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {t.steps.map((item, i) => (
              <div
                key={i}
                className={`p-6 rounded-2xl border transition-colors relative overflow-hidden ${
                  theme === "dark"
                    ? "bg-gray-900/50 border-gray-800 hover:border-blue-500/30"
                    : "bg-white border-slate-200 shadow-sm hover:shadow-md"
                }`}
              >
                <div
                  className={`text-5xl font-black mb-4 absolute -mt-10 select-none ${
                    lang === "fa"
                      ? "-mr-4 left-auto right-0"
                      : "-ml-4 right-auto left-0"
                  } ${
                    theme === "dark" ? "text-blue-900/20" : "text-slate-100"
                  }`}
                >
                  {item.step}
                </div>
                <h3 className="text-lg md:text-xl font-bold text-blue-500 mb-3 relative z-10">
                  {item.title}
                </h3>
                <p
                  className={`text-sm leading-6 relative z-10 ${
                    theme === "dark" ? "text-gray-400" : "text-slate-600"
                  }`}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Second Mind Definition */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-6">
            <h2
              className={`text-2xl md:text-3xl font-bold ${
                theme === "dark" ? "text-white" : "text-slate-900"
              }`}
            >
              {t.whatIsTitle}
            </h2>
            <p
              className={`text-sm md:text-base leading-7 text-justify ${
                theme === "dark" ? "text-gray-300" : "text-slate-600"
              }`}
            >
              {t.whatIsP1}
            </p>
            <p
              className={`text-sm md:text-base leading-7 text-justify ${
                theme === "dark" ? "text-gray-300" : "text-slate-600"
              }`}
            >
              {t.whatIsP2}
            </p>
          </div>
          <div
            className={`p-8 rounded-3xl border flex items-center justify-center min-h-[250px] md:min-h-[300px] ${
              theme === "dark"
                ? "bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-white/5"
                : "bg-white border-slate-200 shadow-sm"
            }`}
          >
            <p
              className={`text-center italic text-sm md:text-base ${
                theme === "dark" ? "text-gray-400" : "text-slate-500"
              }`}
            >
              "{t.whatIsQuote}"
            </p>
          </div>
        </section>

        {/* Quality Section */}
        <section
          className={`rounded-3xl p-6 md:p-12 relative overflow-hidden ${
            theme === "dark"
              ? "bg-gray-900"
              : "bg-white shadow-lg border border-slate-100"
          }`}
        >
          <div
            className={`absolute top-0 w-full h-1 bg-gradient-to-r from-blue-500 to-yellow-500 ${
              lang === "fa" ? "left-0" : "right-0"
            }`}
          ></div>
          <h2
            className={`text-xl md:text-2xl font-bold mb-6 ${
              theme === "dark" ? "text-white" : "text-slate-900"
            }`}
          >
            {t.qualityTitle}
          </h2>
          <p
            className={`mb-6 text-sm md:text-base leading-7 ${
              theme === "dark" ? "text-gray-300" : "text-slate-600"
            }`}
          >
            {t.qualityDesc}
          </p>
          <ul
            className={`space-y-4 text-sm md:text-base ${
              theme === "dark" ? "text-gray-400" : "text-slate-600"
            }`}
          >
            {t.qualityPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-green-500 mt-1 min-w-[16px]">✓</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Collaboration & Welfare */}
        <section className="space-y-12">
          <div>
            <h3
              className={`text-xl md:text-2xl font-bold mb-4 ${
                theme === "dark" ? "text-blue-200" : "text-blue-700"
              }`}
            >
              {t.collabTitle}
            </h3>
            <p
              className={`text-sm md:text-base leading-7 text-justify ${
                theme === "dark" ? "text-gray-400" : "text-slate-600"
              }`}
            >
              {t.collabDesc}
            </p>
          </div>

          <div>
            <h3
              className={`text-xl md:text-2xl font-bold mb-4 ${
                theme === "dark" ? "text-yellow-200" : "text-yellow-600"
              }`}
            >
              {t.welfareTitle}
            </h3>
            <p
              className={`text-sm md:text-base leading-7 text-justify ${
                theme === "dark" ? "text-gray-400" : "text-slate-600"
              }`}
            >
              {t.welfareDesc}
            </p>
          </div>
        </section>
      </main>

      {/* Footer / CTA */}
      <footer
        className={`relative border-t pt-16 md:pt-20 pb-10 px-6 mt-12 transition-colors ${
          theme === "dark"
            ? "bg-gray-900 border-gray-800"
            : "bg-slate-100 border-slate-200"
        }`}
      >
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2
            className={`text-2xl md:text-4xl font-bold ${
              theme === "dark" ? "text-white" : "text-slate-900"
            }`}
          >
            {t.ctaTitle}
          </h2>
          <p
            className={`text-sm md:text-base ${
              theme === "dark" ? "text-gray-400" : "text-slate-600"
            }`}
          >
            {t.ctaDesc}
          </p>

          <form
            className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
            onSubmit={handleNewsletterSubmit}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.emailPlaceholder}
              className={`flex-1 border rounded-xl px-6 py-4 focus:outline-none focus:border-blue-500 transition-colors w-full ${
                lang === "fa" ? "text-right" : "text-left"
              } ${
                theme === "dark"
                  ? "bg-black/50 border-gray-700 text-white placeholder-gray-600"
                  : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 shadow-sm"
              }`}
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] w-full sm:w-auto"
            >
              {loading
                ? lang === "fa"
                  ? "در حال ثبت..."
                  : "Subscribing..."
                : t.submitBtn}
            </button>
          </form>

          {successMsg && (
            <p className="mt-3 text-sm text-green-500 text-center">
              {successMsg}
            </p>
          )}
          {errorMsg && (
            <p className="mt-3 text-sm text-red-500 text-center">{errorMsg}</p>
          )}

          {/* Social Links */}
          <div
            className={`pt-12 border-t mt-12 ${
              theme === "dark" ? "border-gray-800" : "border-slate-300"
            }`}
          >
            <h4
              className={`text-xs md:text-sm font-bold uppercase mb-6 tracking-widest ${
                theme === "dark" ? "text-white/50" : "text-slate-400"
              }`}
            >
              {t.socialTitle}
            </h4>
            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              {/* Telegram Group */}
              <a
                href="https://t.me/+Ir2GvEqTuZQwZWNk"
                target="_blank"
                rel="noreferrer"
                className={`group relative transition-colors ${
                  theme === "dark"
                    ? "text-gray-400 hover:text-blue-400"
                    : "text-slate-400 hover:text-blue-600"
                }`}
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Telegram Group
                </span>
              </a>

              {/* Telegram Channel */}
              <a
                href="https://t.me/+k0pS8WSbU7U1ZDc0"
                target="_blank"
                rel="noreferrer"
                className={`group relative transition-colors ${
                  theme === "dark"
                    ? "text-gray-400 hover:text-blue-400"
                    : "text-slate-400 hover:text-blue-600"
                }`}
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.14-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                </svg>
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Telegram Channel
                </span>
              </a>

              {/* Twitter / X */}
              <a
                href="https://x.com/secondmynd"
                target="_blank"
                rel="noreferrer"
                className={`group relative transition-colors ${
                  theme === "dark"
                    ? "text-gray-400 hover:text-white"
                    : "text-slate-400 hover:text-black"
                }`}
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  X (Twitter)
                </span>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/secondmynd/"
                target="_blank"
                rel="noreferrer"
                className={`group relative transition-colors ${
                  theme === "dark"
                    ? "text-gray-400 hover:text-pink-500"
                    : "text-slate-400 hover:text-pink-600"
                }`}
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.069-4.85.069-3.204 0-3.584-.012-4.849-.069-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                </svg>
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Instagram
                </span>
              </a>

              {/* Github */}
              <a
                href="https://github.com/Psyberhive/smynd_app"
                target="_blank"
                rel="noreferrer"
                className={`group relative transition-colors ${
                  theme === "dark"
                    ? "text-gray-400 hover:text-white"
                    : "text-slate-400 hover:text-black"
                }`}
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  GitHub
                </span>
              </a>
            </div>
          </div>

          <div
            className={`pt-8 text-xs md:text-sm ${
              theme === "dark" ? "text-gray-600" : "text-slate-400"
            }`}
          >
            {t.footerCopyright}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
