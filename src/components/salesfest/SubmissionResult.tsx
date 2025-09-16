import React, { useState, useEffect } from "react";
import { Gift, Frown, X, Home } from "lucide-react";
import { SubmissionResponse, GiftItem } from "./gift";
import { useRouter } from "next/navigation";
import Image from "next/image";
import SlotMachine from "./Slot";

interface SubmissionResultProps {
  submissionResponse: SubmissionResponse;
  giftList: GiftItem[];
}

const SubmissionResult: React.FC<SubmissionResultProps> = ({
  submissionResponse,
  giftList,
}) => {
  // const [rotation, setRotation] = useState<number>(0);
  // const [isSpinning, setIsSpinning] = useState<boolean>(false);
  // const [hasSpun, setHasSpun] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  // const [windowDimensions, setWindowDimensions] = useState<{
  //   width: number;
  //   height: number;
  // }>({
  //   width: 0,
  //   height: 0,
  // });
  const router = useRouter();

  // useEffect(() => {
  //   const updateWindowDimensions = () => {
  //     setWindowDimensions({
  //       width: window.innerWidth,
  //       height: window.innerHeight,
  //     });
  //   };

  //   updateWindowDimensions();
  //   window.addEventListener("resize", updateWindowDimensions);

  //   return () => window.removeEventListener("resize", updateWindowDimensions);
  // }, []);

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const closePopup = () => {
    setShowPopup(false);
  };

  const goToHome = () => {
    router.push("/");
  };

  return (
    <div className=" w-full">
      {/* {showConfetti && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{ zIndex: 9999 }}
        >
          <Confetti
            width={windowDimensions.width}
            height={windowDimensions.height}
            recycle={false}
            numberOfPieces={500}
            gravity={0.3}
            initialVelocityY={10}
            className="z-50"
            confettiSource={{
              x: windowDimensions.width / 2,
              y: 0,
              w: 0,
              h: 0,
            }}
          />
        </div>
      )} */}
      <div
        className="h-screen"
        style={{
          backgroundImage: `url(/newtestframe.png)`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPositionX: "center",
          backgroundPositionY: "top",
        }}
      >
        <SlotMachine giftList={giftList} />
      </div>
      {/* Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative animate-fade-in-up">
            <button
              onClick={closePopup}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
            <h3 className="text-2xl font-bold mb-4 flex items-center justify-center">
              {submissionResponse.gift &&
              submissionResponse.gift.length > 0 &&
              submissionResponse.gift.some(
                (gift) => gift.name !== "Better Luck"
              ) ? (
                <>
                  <Gift className="mr-2" size={24} />
                  Congratulations!
                </>
              ) : (
                <>
                  <Frown className="mr-2" size={24} />
                  Thank you for participating!
                </>
              )}
            </h3>
            {submissionResponse.gift &&
            submissionResponse.gift.length > 0 &&
            submissionResponse.gift.some(
              (gift) => gift.name !== "Better Luck"
            ) ? (
              <>
                <p className="text-xl mb-4">
                  You&apos;ve won{" "}
                  {
                    submissionResponse.gift.filter(
                      (gift) => gift.name !== "Better Luck"
                    ).length
                  }{" "}
                  amazing prize(s)!
                </p>
                <p className="text-lg mb-4">
                  Your IMEI number is {submissionResponse.imei}
                </p>
                <div className="grid grid-cols-1 gap-4 mb-4">
                  {submissionResponse.gift
                    .filter((gift) => gift.name !== "Better Luck")
                    .map((gift) => (
                      <div key={gift.id} className="text-center">
                        <p className="text-lg font-bold mb-2">{gift.name}</p>
                        <Image
                          src={gift.image}
                          alt={gift.name}
                          width={120}
                          height={120}
                          className="mx-auto object-contain"
                        />
                        <p className="text-sm text-gray-600 capitalize">
                          {gift.category} Prize
                        </p>
                      </div>
                    ))}
                </div>
              </>
            ) : (
              <>
                <p className="text-xl mb-4 text-[#ff6666]">
                  Unfortunately, you didn&apos;t win a prize this time. Try
                  again next time!
                </p>
                <Image
                  src="/betterlucknexttime.png"
                  alt="Better Luck Next Time"
                  width={150}
                  height={150}
                  className="mx-auto object-contain"
                />
              </>
            )}
            <p className="text-2xl font-bold mt-6 mb-8 text-[#ff8c00]">
              Happy Dashain 2082!
            </p>
            <button
              onClick={goToHome}
              className="w-full bg-[#ff6666] text-white px-6 py-2 rounded-full text-lg font-bold uppercase tracking-wide hover:bg-[#ff8080] transition duration-300 ease-in-out transform hover:scale-105 shadow-lg flex items-center justify-center"
            >
              <Home className="mr-2" size={20} />
              Back to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionResult;
