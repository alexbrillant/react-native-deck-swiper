declare module 'react-native-deck-swiper' {
  import {StyleProp, ViewStyle} from 'react-native';

  export interface SwiperProps<T> {
    animateCardOpacity?: boolean;
    animateOverlayLabelsOpacity?: boolean;
    backgroundColor?: string;
    cardHorizontalMargin?: number;
    cardIndex?: number;
    cards: T[];
    cardStyle?: number | object;
    cardVerticalMargin?: number;
    childrenOnTop?: boolean;
    containerStyle?: object;
    disableBottomSwipe?: boolean;
    disableLeftSwipe?: boolean;
    disableRightSwipe?: boolean;
    disableTopSwipe?: boolean;
    horizontalSwipe?: boolean;
    horizontalThreshold?: number;
    goBackToPreviousCardOnSwipeBottom?: boolean;
    goBackToPreviousCardOnSwipeLeft?: boolean;
    goBackToPreviousCardOnSwipeRight?: boolean;
    goBackToPreviousCardOnSwipeTop?: boolean;
    infinite?: boolean;
    inputCardOpacityRangeX?: [number, number, number, number, number];
    inputCardOpacityRangeY?: [number, number, number, number, number];
    inputOverlayLabelsOpacityRangeX?: [number, number, number, number, number];
    inputOverlayLabelsOpacityRangeY?: [number, number, number, number, number];
    inputRotationRange?: [number, number, number];
    keyExtractor?: (cardData: T) => string;
    marginBottom?: number;
    marginTop?: number;
    onSwiped?: (cardIndex: number) => void;
    onSwipedAborted?: () => void;
    onSwipedAll?: () => void;
    onSwipedBottom?: (cardIndex: number) => void;
    onSwipedLeft?: (cardIndex: number) => void;
    onSwipedRight?: (cardIndex: number) => void;
    onSwipedTop?: (cardIndex: number) => void;
    onSwiping?: () => void;
    onTapCard?: (cardIndex: number) => void;
    onTapCardDeadZone?: number;
    outputCardOpacityRangeX?: [number, number, number, number, number];
    outputCardOpacityRangeY?: [number, number, number, number, number];
    outputOverlayLabelsOpacityRangeX?: [number, number, number];
    outputOverlayLabelsOpacityRangeY?: [number, number, number];
    outputRotationRange?: [string, string, string];
    overlayLabels?: object;
    overlayLabelStyle?: StyleProp<ViewStyle>;
    overlayLabelWrapperStyle?: StyleProp<ViewStyle>;
    overlayOpacityHorizontalThreshold?: number;
    overlayOpacityVerticalThreshold?: number;
    pointerEvents?: string;
    previousCardDefaultPositionX?: number;
    previousCardDefaultPositionY?: number;
    renderCard: (cardData: T, cardIndex: number) => JSX.Element | null;
    secondCardZoom?: number;
    showSecondCard?: boolean;
    stackAnimationFriction?: number;
    stackAnimationTension?: number;
    stackScale?: number;
    stackSeparation?: number;
    stackSize?: number;
    swipeAnimationDuration?: number;
    swipeBackCard?: boolean;
    topCardResetAnimationFriction?: number;
    topCardResetAnimationTension?: number;
    useViewOverflow?: boolean;
    verticalSwipe?: boolean;
    verticalThreshold?: number;
    zoomAnimationDuration?: number;
    zoomFriction?: number;
  }

  export default class Swiper<T> extends React.Component<SwiperProps<T>> {
    swipeLeft: (mustDecrementCardIndex?: boolean) => void;
    swipeRight: (mustDecrementCardIndex?: boolean) => void;
    swipeTop: (mustDecrementCardIndex?: boolean) => void;
    swipeBottom: (mustDecrementCardIndex?: boolean) => void;
    jumpToCardIndex: (cardIndex: number) => void;
    swipeBack: (
      cb?: (previousCardIndex: number, previousCard: T) => void
    ) => void;
  }
}
