"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { OrganizationData, GiftItem } from "./gift";
import {
  processSubmissionForSingleWheel,
  SpriteWheelItem as UtilSpriteWheelItem,
  calculateRotationForItem,
} from "./spriteWheel";
import Image from "next/image";

const SlotMachine = ({ giftList }: { giftList: GiftItem[] }) => {
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [hasSpun, setHasSpun] = useState<boolean>(false);
  const [currentPhase, setCurrentPhase] = useState<number>(0); // 0: ready, 1: minor, 2: major, 3: grand, 4: complete
  console.log(currentPhase);
  const [, setOrgData] = useState<OrganizationData | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [mobileCurrentItem, setMobileCurrentItem] = useState<number>(0);
  console.log(mobileCurrentItem);
  const router = useRouter();

  // Single sprite wheel state (no categories)
  const [singleWheel, setSingleWheel] = useState<UtilSpriteWheelItem[] | null>(
    null
  );
  const [winningItem, setWinningItem] = useState<UtilSpriteWheelItem | null>(
    null
  );
  const [wheelRotation, setWheelRotation] = useState<number>(0);
  const [initialOffset, setInitialOffset] = useState<number>(0);
  const [highlightActive, setHighlightActive] = useState<boolean>(false);

  const spinAudioRef = useRef<HTMLAudioElement | null>(null);
  const stopAudioRef = useRef<HTMLAudioElement | null>(null);
  const winAudioRef = useRef<HTMLAudioElement | null>(null);

  // Ref for single wheel container
  const wheelRef = useRef<HTMLDivElement>(null);
  const wheelContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Lock body scroll while SlotMachine is mounted
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    // Initialize audio elements once on mount
    const spinAudio = new Audio("/sounds/0913.MP3");
    spinAudio.loop = true;
    spinAudioRef.current = spinAudio;

    stopAudioRef.current = new Audio("/sounds/stop.ogg");
    winAudioRef.current = new Audio("/sounds/win.ogg");

    return () => {
      // Cleanup on unmount
      spinAudioRef.current?.pause();
      spinAudioRef.current = null;
      stopAudioRef.current = null;
      winAudioRef.current = null;
    };
  }, []); // one-time setup is intentional

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const titleConfig = {
    title: "Lucky Draw",
    subtitle: "Good luck!",
    color: "from-yellow-400 via-orange-500 to-red-500",
  };

  // Load submission data from localStorage and initialize single sprite wheel
  useEffect(() => {
    const storedSubmissionData = localStorage.getItem("submissionData");
    const storedOrgData = localStorage.getItem("orgData");

    if (storedSubmissionData && storedOrgData) {
      try {
        const parsedSubmissionData = JSON.parse(storedSubmissionData);
        const parsedOrgData = JSON.parse(storedOrgData);
        setOrgData(parsedOrgData);

        // Initialize single sprite wheel (no categories)
        const { singleWheel, winningItem } = processSubmissionForSingleWheel(
          parsedSubmissionData,
          giftList,
          "/betterlucknexttime.png"
        );

        setSingleWheel(singleWheel);
        setWinningItem(winningItem);

        // Measure container height to precisely center the winning item
        const measuredHeight = wheelContainerRef.current?.clientHeight ?? 672; // fallback 42rem (3 x 14rem)
        const rotation = calculateRotationForItem(
          winningItem.index,
          8,
          224,
          measuredHeight
        );
        setWheelRotation(rotation);

        // Set initial centering so the first item is aligned inside highlight
        const centerOffset = measuredHeight / 2 - 224 / 2;
        setInitialOffset(centerOffset);

        console.log("Single sprite wheel initialized:", singleWheel);
        console.log("Winning item:", winningItem);
        console.log("Rotation:", rotation);
      } catch (error) {
        console.error("Error parsing stored data:", error);
        router.push("/info");
      }
    } else {
      // No submission data found, redirect to info page
      router.push("/info");
    }
  }, [router, giftList]);

  const startLuckyDraw = async () => {
    if (isSpinning || !singleWheel || !winningItem) return;

    setIsSpinning(true);
    setCurrentPhase(1);
    setMobileCurrentItem(0);

    try {
      console.log(`Starting single wheel spin...`);
      setHighlightActive(true);
      await spinSpriteWheel(wheelRef, 10000); // Max 10 seconds

      // Delay to view result
      if (isMobile) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      } else {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      setCurrentPhase(2);
      setIsSpinning(false);
      setHasSpun(true);
    } catch (error) {
      console.error("Error during spinning:", error);
      setIsSpinning(false);
    }
  };

  const spinSpriteWheel = async (
    wheelRef: React.RefObject<HTMLDivElement | null>,
    duration: number = 10000 // Max 10 seconds
  ): Promise<void> => {
    return new Promise((resolve) => {
      if (!wheelRef.current || !singleWheel || !winningItem) {
        resolve();
        return;
      }

      // Start spin sound
      if (spinAudioRef.current) {
        spinAudioRef.current.currentTime = 0;
        spinAudioRef.current.play().catch(() => {
          // Autoplay might be blocked; ignore
        });
      }

      const wheel = wheelRef.current;
      const targetRotation = wheelRotation;
      const startTime = Date.now();

      // Constants for smooth animation (must match CSS heights below)
      const itemHeight = 224; // Height of each item (14rem = 224px)
      const wheelHeight = 8 * itemHeight; // Total wheel height

      // Calculate total rotations needed for dramatic effect
      const baseRotations = 6; // Reduced base rotations for shorter duration
      const totalRotation = targetRotation + baseRotations * wheelHeight;
      const startY = -initialOffset; // current transform at rest (matches initial render)
      const endY = -totalRotation; // desired final transform

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Improved 3-phase animation timing
        let easedProgress;

        // Phase durations (in milliseconds)
        const slowStartMs = 3000; // Very slow start for 3 seconds
        const slowEndMs = 0; // Very slow end for 3 seconds
        const fastMiddleMs = duration - slowStartMs - slowEndMs; // Fast middle section

        // Distance allocation for each phase
        const slowStartPortion = 0.25; // Only 5% of distance in first 3 seconds (very slow)
        const slowEndPortion = 0.0; // 15% of distance in last 3 seconds (slow deceleration)
        const fastMiddlePortion = 0.75; // 80% of distance in middle section (fast)

        if (elapsed <= slowStartMs) {
          // Phase 1: Ultra-slow ease-in over first 3 seconds
          const phaseProgress = elapsed / slowStartMs; // 0 to 1
          // Use a very gentle curve for ultra-slow start
          const ultraSlowEase = Math.pow(phaseProgress, 6); // Even slower than quintic
          easedProgress = slowStartPortion * ultraSlowEase;
        } else if (elapsed <= slowStartMs + fastMiddleMs) {
          // Phase 2: Fast movement in middle section
          const phaseProgress =
            fastMiddleMs > 0 ? (elapsed - slowStartMs) / fastMiddleMs : 1;
          // Use a swift but smooth curve
          const fastEase =
            phaseProgress < 0.5
              ? 8 * Math.pow(phaseProgress, 4)
              : 1 - Math.pow(-2 * phaseProgress + 2, 4) / 2;

          easedProgress = slowStartPortion + fastMiddlePortion * fastEase;
        } else {
          // Phase 3: Very slow deceleration over final 3 seconds
          const phaseProgress =
            (elapsed - slowStartMs - fastMiddleMs) / slowEndMs;
          // Use a very gradual deceleration curve
          const slowEndEase = 1 - Math.pow(1 - phaseProgress, 8); // Even slower deceleration

          easedProgress =
            slowStartPortion + fastMiddlePortion + slowEndPortion * slowEndEase;
        }

        // Ensure we don't exceed 1
        easedProgress = Math.min(easedProgress, 1);
        console.log(easedProgress);

        // Interpolate from startY to endY
        const currentY = startY + (endY - startY) * progress;

        // Apply translation to wheel (vertical sprite wheel)
        wheel.style.transform = `translateY(${currentY}px)`;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Spinning complete
          // Stop spin sound and play stop+win sounds
          if (spinAudioRef.current) {
            spinAudioRef.current.pause();
          }
          if (stopAudioRef.current) {
            stopAudioRef.current.currentTime = 0;
            stopAudioRef.current.play().catch(() => {});
          }

          // Play win sound when item lands
          if (winAudioRef.current) {
            winAudioRef.current.currentTime = 0;
            winAudioRef.current.play().catch(() => {});
          }

          console.log(`Spin completed with winning item:`, winningItem);
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  };

  const renderSpriteWheel = () => {
    if (!singleWheel) {
      return <div>Loading...</div>;
    }

    const wheelItems = singleWheel;
    const isCompleted = hasSpun;
    const shouldShow = true;

    return (
      <div
        className={`text-center ${
          isMobile
            ? "absolute inset-0 transition-all duration-700 ease-in-out"
            : ""
        } ${
          isMobile && shouldShow
            ? "opacity-100 scale-100"
            : isMobile
            ? "opacity-0 scale-95"
            : ""
        }`}
      >
        {/* Sprite Wheel Container */}
        <div className="relative mt-36">
          <div
            className={`transition-all duration-500 overflow-hidden
            ${highlightActive ? "scale-105" : ""}
          `}
          >
            <div
              ref={wheelContainerRef}
              className="relative bg-slate-900/60 w-[22rem] h-[42rem] overflow-hidden rounded-2xl mx-auto backdrop-blur-xl"
              style={{
                perspective: "1000px",
                border: `1px solid rgba(255, 255, 255, 0.2)`,
                boxShadow: `
                  0 8px 32px rgba(0, 0, 0, 0.3),
                  0 2px 8px rgba(0, 0, 0, 0.2),
                  inset 0 1px 0 rgba(255, 255, 255, 0.1),
                  inset 0 -1px 0 rgba(0, 0, 0, 0.1)
                `,
                position: "relative",
              }}
            >
              {/* Subtle Inner Border Highlight */}
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  background: `linear-gradient(135deg, 
                    rgba(255, 255, 255, 0.1) 0%, 
                    transparent 20%, 
                    transparent 80%, 
                    rgba(255, 255, 255, 0.05) 100%
                  )`,
                  border: `1px solid rgba(255, 255, 255, 0.1)`,
                  boxShadow: `inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
                }}
              />

              {/* Sprite Wheel Items */}
              <div
                ref={wheelRef}
                className="transition-transform duration-100 ease-linear"
                style={{
                  transform: `translateY(${-initialOffset}px)`,
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Create multiple sets for infinite scrolling */}
                {Array.from({ length: 50 }, (_, setIndex) =>
                  wheelItems.map((item, index) => (
                    <div
                      key={`single-set${setIndex}-${index}`}
                      className="flex-shrink-0 h-[14rem] flex items-center justify-center w-full"
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      {(() => {
                        const isWinning =
                          isCompleted && winningItem?.index === item.index;
                        return (
                          <div
                            className={`w-full h-[12rem] flex items-center justify-center mx-auto transition-transform duration-500 ease-out ${
                              isWinning ? "scale-[0.95]" : "scale-100"
                            }`}
                          >
                            <Image
                              src={`${item.image}`}
                              alt={item.name}
                              width={400}
                              height={400}
                              priority
                              className={`object-contain bg-transparent transition-all duration-500 ${
                                isWinning
                                  ? "w-[120%] h-[120%] drop-shadow-2xl"
                                  : "w-[100%] h-[100%]"
                              }`}
                            />
                          </div>
                        );
                      })()}
                    </div>
                  ))
                )}
              </div>

              {/* Selection Highlight */}
              {highlightActive && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    className={`w-full h-[14rem] border-4 border-yellow-300/90 bg-yellow-300/5 shadow-[0_0_22px_rgba(234,179,8,0.35)] ${
                      isCompleted
                        ? "animate-none border-green-400/90 bg-green-400/10"
                        : "animate-pulse"
                    }`}
                    style={{
                      animation: isCompleted
                        ? "none"
                        : "glow-pulse 1.5s ease-in-out infinite alternate",
                      boxShadow: isCompleted
                        ? "0_0_30px_rgba(34,197,94,0.5), 0_0_60px_rgba(34,197,94,0.3), 0_0_90px_rgba(34,197,94,0.15)"
                        : "0_0_22px_rgba(234,179,8,0.35), 0_0_44px_rgba(234,179,8,0.2), 0_0_66px_rgba(234,179,8,0.1)",
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Label */}
          <div className="mt-4 text-center">
            <div
              className={`bg-gradient-to-r px-6 py-6 rounded-2xl shadow-lg transition-colors duration-500 ${
                isCompleted
                  ? "from-green-400 via-emerald-500 to-green-600"
                  : titleConfig.color
              }`}
            >
              <h3 className="text-black font-black text-4xl">
                {titleConfig.title}
                {isCompleted && " ✓"}
              </h3>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div
        className="h-screen overflow-hidden flex items-start justify-center bg-cover bg-center bg-no-repeat bg-image 
      scale-y-[0.6] scale-x-[0.7] 
      2xl:scale-y-[0.8] 2xl:scale-x-[0.9]"
      >
        <div className="">
          {/* Header */}

          {/* Single Sprite Wheel */}
          <div
            className={`${
              isMobile ? "relative h-[700px] w-[400px]" : "flex justify-center"
            } gap-6 mb-0 mt-0 2xl:mt-10`}
          >
            {singleWheel && renderSpriteWheel()}
          </div>
        </div>
      </div>

      <div className="fixed bottom-8 right-8 z-50">
        {hasSpun ? (
          // Back to Home button after all tiers completed
          <button
            onClick={() => {
              // Check if we're already on the home page
              if (window.location.pathname === "/admin/salesfest") {
                // If already on home page, just refresh
                window.location.reload();
              } else {
                // If on different page, navigate to home
                router.push("/admin/salesfest");
              }
            }}
            className="hover:scale-105 active:scale-95"
          >
            <img
              src="/bth.png"
              className="w-[180px] h-auto transition-transform duration-200 "
              alt="Back to Home"
            />
          </button>
        ) : (
          // Spin Now button for active spins
          <button
            onClick={startLuckyDraw}
            disabled={isSpinning || hasSpun || !singleWheel}
            aria-label="Start Lucky Draw"
            className="focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <img
              src="/spinbtn.png"
              alt="Spin Now"
              className={`w-[180px] h-auto transition-transform duration-200 ${
                isSpinning || hasSpun || !singleWheel
                  ? ""
                  : "hover:scale-105 active:scale-95"
              }`}
            />
          </button>
        )}
      </div>
    </>
  );
};

export default SlotMachine;
