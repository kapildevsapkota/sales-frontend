import { GiftItem } from "./gift";

export interface SpriteWheelItem {
  id: number;
  name: string;
  image: string;
  category: string;
  lucky_draw_system: number;
  index: number; // Position in the sprite wheel
}

export interface SpriteWheelConfig {
  minor: SpriteWheelItem[];
  major: SpriteWheelItem[];
  grand: SpriteWheelItem[];
}

export interface SubmissionResponse {
  customer_name: string;
  date_of_purchase: string;
  gift: GiftItem[];
  imei: string;
  phone_model: string;
  phone_number: string;
  shop_name: string;
  sold_area: string;
  email?: string;
}

/**
 * Creates a vertical sprite wheel configuration for each tier
 * Each wheel has 8 items total with "Better Luck Next Time" as filler
 */
export function createSpriteWheel(
  giftList: GiftItem[],
  betterLuckImageSrc: string = "/assets/betterlucknexttime.png"
): SpriteWheelConfig {
  const betterLuckItem: SpriteWheelItem = {
    id: -1,
    name: "Better Luck Next Time",
    image: betterLuckImageSrc,
    category: "",
    lucky_draw_system: 1,
    index: 0,
  };

  // Helper function to create wheel for a specific category
  const createWheelForCategory = (
    category: "minor" | "major" | "grand",
    backendGifts: GiftItem[]
  ): SpriteWheelItem[] => {
    const categoryGifts = backendGifts.filter(
      (gift) => gift.category === category
    );

    // Start with backend gifts
    const wheelItems: SpriteWheelItem[] = [];

    // Add backend gifts first
    categoryGifts.forEach((gift, i) => {
      wheelItems.push({
        id: gift.id,
        name: gift.name,
        image: gift.image,
        category: gift.category,
        lucky_draw_system: gift.lucky_draw_system,
        index: i,
      });
    });

    // Fill remaining slots with "Better Luck Next Time" to reach 8 total items
    const remainingSlots = 8 - wheelItems.length;
    for (let i = 0; i < remainingSlots; i++) {
      wheelItems.push({
        ...betterLuckItem,
        category,
        index: wheelItems.length,
      });
    }

    return wheelItems;
  };

  return {
    minor: createWheelForCategory("minor", giftList),
    major: createWheelForCategory("major", giftList),
    grand: createWheelForCategory("grand", giftList),
  };
}

/**
 * Determines the winning item for a specific tier based on submission response
 */
export function getWinningItemForTier(
  tier: "minor" | "major" | "grand",
  spriteWheel: SpriteWheelConfig,
  submissionResponse: SubmissionResponse
): SpriteWheelItem {
  const tierWheel = spriteWheel[tier];

  // Check if user won a gift in this category
  const categoryGift = submissionResponse.gift?.find(
    (gift) => gift.category === tier
  );

  if (categoryGift) {
    // Find the specific gift in the wheel
    const foundItem = tierWheel.find((item) => item.id === categoryGift.id);
    if (foundItem) {
      return foundItem;
    }
  }

  // Return "Better Luck Next Time" (last item in wheel)
  return tierWheel[tierWheel.length - 1];
}

/**
 * Calculates the translation needed to position a specific item at the winning position
 * The winning position is moved to the top with a 60px offset
 */
export function calculateRotationForItem(
  itemIndex: number,
  totalItems: number = 8,
  itemHeight: number = 224, // Height of each item in pixels (14rem = 224px). Must match Slot.tsx
  containerHeight: number = 704 // Height of the visible wheel window (44rem = 704px). Must match Slot.tsx
): number {
  // Calculate the position of the item in the wheel
  const itemPosition = itemIndex * itemHeight;

  // The winning item should appear centered within the highlight box.
  // Highlight is the same height as one item and centered in the container.
  // Center offset = (containerHeight / 2) - (itemHeight / 2)
  const centerOffset = containerHeight / 2 - itemHeight / 2;
  const targetPosition = itemPosition - centerOffset;

  // Add multiple wheel rotations for dramatic effect
  const wheelHeight = totalItems * itemHeight;
  const extraRotations = 5 * wheelHeight; // 5 full wheel rotations for smooth effect

  return targetPosition + extraRotations;
}

/**
 * Gets the sprite wheel items in the order they should appear vertically
 * This is important for the visual representation
 */
export function getVerticalSpriteOrder(
  wheelItems: SpriteWheelItem[],
  currentIndex: number = 0
): SpriteWheelItem[] {
  // Create a circular array starting from current index
  const result: SpriteWheelItem[] = [];

  for (let i = 0; i < 3; i++) {
    // Show 3 items at a time
    const index = (currentIndex + i) % wheelItems.length;
    result.push(wheelItems[index]);
  }

  return result;
}

/**
 * Animates the sprite wheel to the winning position
 */
export function animateSpriteWheel(
  wheelRef: React.RefObject<HTMLDivElement>,
  targetRotation: number,
  duration: number = 3000
): Promise<void> {
  return new Promise((resolve) => {
    if (!wheelRef.current) {
      resolve();
      return;
    }

    const wheel = wheelRef.current;
    const startTime = Date.now();

    // Start with fast spinning
    let currentRotation = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);

      // Calculate current rotation with easing
      currentRotation = easeOut * targetRotation;

      wheel.style.transform = `translateY(${currentRotation}px)`;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        resolve();
      }
    };

    requestAnimationFrame(animate);
  });
}

/**
 * Processes the submission response and creates sprite wheels for all tiers
 */
export function processSubmissionForSpriteWheels(
  submissionResponse: SubmissionResponse,
  giftList: GiftItem[],
  betterLuckImageSrc: string = "/assets/betterlucknexttime.png"
): {
  spriteWheels: SpriteWheelConfig;
  winningItems: {
    minor: SpriteWheelItem;
    major: SpriteWheelItem;
    grand: SpriteWheelItem;
  };
  rotations: {
    minor: number;
    major: number;
    grand: number;
  };
} {
  const spriteWheels = createSpriteWheel(giftList, betterLuckImageSrc);

  const winningItems = {
    minor: getWinningItemForTier("minor", spriteWheels, submissionResponse),
    major: getWinningItemForTier("major", spriteWheels, submissionResponse),
    grand: getWinningItemForTier("grand", spriteWheels, submissionResponse),
  };

  const rotations = {
    minor: calculateRotationForItem(winningItems.minor.index),
    major: calculateRotationForItem(winningItems.major.index),
    grand: calculateRotationForItem(winningItems.grand.index),
  };

  return {
    spriteWheels,
    winningItems,
    rotations,
  };
}

/**
 * SINGLE WHEEL (no categories)
 * Creates a single sprite wheel of exactly 8 items using the given gifts, and
 * fills remaining slots with a "Better Luck Next Time" item.
 */
export function createSingleSpriteWheel(
  giftList: GiftItem[],
  betterLuckImageSrc: string = "/assets/betterlucknexttime.png"
): SpriteWheelItem[] {
  const prototypeBetterLuckItem: SpriteWheelItem = {
    id: -1,
    name: "Better Luck Next Time",
    image: betterLuckImageSrc,
    category: "",
    lucky_draw_system: 1,
    index: 0,
  };

  const realGifts: SpriteWheelItem[] = giftList.slice(0, 8).map((gift) => ({
    id: gift.id,
    name: gift.name,
    image: gift.image,
    category: gift.category,
    lucky_draw_system: gift.lucky_draw_system,
    index: 0, // will be assigned below
  }));

  // Initialize wheel with BLNT placeholders at all 8 positions
  const wheel: SpriteWheelItem[] = new Array(8).fill(null).map((_, idx) => ({
    ...prototypeBetterLuckItem,
    index: idx,
  }));

  // Place gifts into even indices first to achieve image/BLNT alternation
  let giftPointer = 0;
  const evenIndices = [0, 2, 4, 6];
  const oddIndices = [1, 3, 5, 7];

  for (const evenIdx of evenIndices) {
    if (giftPointer >= realGifts.length) break;
    wheel[evenIdx] = { ...realGifts[giftPointer], index: evenIdx };
    giftPointer += 1;
  }

  // If more than 4 gifts, place remaining into odd slots
  for (const oddIdx of oddIndices) {
    if (giftPointer >= realGifts.length) break;
    wheel[oddIdx] = { ...realGifts[giftPointer], index: oddIdx };
    giftPointer += 1;
  }

  return wheel;
}

/**
 * From submission, pick the first gift (if any) regardless of category, and
 * map to the single wheel. If not found, return BLNT (last item).
 */
export function getWinningItemNoCategory(
  singleWheel: SpriteWheelItem[],
  submissionResponse: SubmissionResponse
): SpriteWheelItem {
  const firstGift = submissionResponse.gift?.[0];
  if (firstGift) {
    const found = singleWheel.find((item) => item.id === firstGift.id);
    if (found) return found;
  }
  return singleWheel[singleWheel.length - 1];
}

/**
 * Processes submission for a single wheel setup (no categories)
 */
export function processSubmissionForSingleWheel(
  submissionResponse: SubmissionResponse,
  giftList: GiftItem[],
  betterLuckImageSrc: string = "/assets/betterlucknexttime.png"
): {
  singleWheel: SpriteWheelItem[];
  winningItem: SpriteWheelItem;
  rotation: number;
} {
  const singleWheel = createSingleSpriteWheel(giftList, betterLuckImageSrc);
  const winningItem = getWinningItemNoCategory(singleWheel, submissionResponse);
  const rotation = calculateRotationForItem(winningItem.index);

  return { singleWheel, winningItem, rotation };
}
