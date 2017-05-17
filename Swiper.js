import React from "react";
import {
  PanResponder,
  Easing,
  Slider,
  Text,
  View,
  Dimensions,
  Animated
} from "react-native";
import styles, { circleSize } from "./styles";
const { height, width } = Dimensions.get("window");

class Swiper extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      pan: new Animated.ValueXY(),
      scale: new Animated.Value(props.secondCardZoom),
      firstCardIndex: props.cardIndex,
      secondCardIndex: this.calculateSecondCardIndex(props.cardIndex),
      previousCardIndex: this.calculatePreviousCardIndex(props.cardIndex),
      previousCardX: new Animated.Value(props.previousCardInitialPositionX),
      previousCardY: new Animated.Value(props.previousCardInitialPositionY),
      swipedAllCards: false,
      panResponderLocked: false
    };
  }

  calculateSecondCardIndex = firstCardIndex => {
    const cardIndexAtLastIndex = firstCardIndex === this.props.cards.length - 1;
    return cardIndexAtLastIndex ? 0 : firstCardIndex + 1;
  };

  calculatePreviousCardIndex = firstCardIndex => {
    const atFirstIndex = firstCardIndex === 0;
    return atFirstIndex ? this.props.cards.length - 1 : firstCardIndex - 1;
  };

  componentWillMount() {
    this._animatedValueX = 0;
    this._animatedValueY = 0;
    this.state.pan.x.addListener(value => (this._animatedValueX = value.value));
    this.state.pan.y.addListener(value => (this._animatedValueY = value.value));
    this.initializeCardStyle();
    this.initializePanResponder();
  }

  componentWillUnmount() {
    this.state.pan.x.removeAllListeners();
    this.state.pan.y.removeAllListeners();
  }

  initializeCardStyle = () => {
    const {
      cardVerticalMargin,
      cardHorizontalMargin,
      marginTop,
      marginBottom
    } = this.props;

    const cardWidth = width - cardHorizontalMargin * 2;
    const cardHeight =
      height - cardVerticalMargin * 2 - marginTop - marginBottom;

    this.cardStyle = {
      top: cardVerticalMargin,
      left: cardHorizontalMargin,
      width: cardWidth,
      height: cardHeight
    };
  };

  initializePanResponder = () => {
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (event, gestureState) => true,
      onMoveShouldSetPanResponder: (event, gestureState) => true,
      onPanResponderGrant: this.onPanResponderGrant,
      onPanResponderMove: Animated.event([null, this.createAnimatedEvent()]),
      onPanResponderRelease: this.onPanResponderRelease
    });
  };

  createAnimatedEvent = () => {
    const { horizontalSwipe, verticalSwipe } = this.props;
    const { x, y } = this.state.pan;
    const dx = horizontalSwipe ? x : 0;
    const dy = verticalSwipe ? y : 0;
    return { dx, dy };
  };

  onPanResponderGrant = (event, gestureState) => {
    if (!this.state.panResponderLocked) {
      this.state.pan.setOffset({
        x: this._animatedValueX,
        y: this._animatedValueY
      });
    }

    this.state.pan.setValue({
      x: 0,
      y: 0
    });
  };

  onPanResponderRelease = (e, gestureState) => {
    const { horizontalThreshold, verticalThreshold } = this.props;
    const animatedValueX = Math.abs(this._animatedValueX);
    const animatedValueY = Math.abs(this._animatedValueY);

    const isSwiping =
      animatedValueX > horizontalThreshold ||
      animatedValueY > verticalThreshold;
    if (isSwiping) {
      const onSwipeDirectionCallback = this.getOnSwipeDirectionCallback(
        this._animatedValueX,
        this._animatedValueY
      );

      this.setState({ panResponderLocked: true }, () => {
        this.swipeCard(onSwipeDirectionCallback);
        this.zoomNextCard();
      });
    } else {
      this.resetTopCard();
    }
  };

  getOnSwipeDirectionCallback = (animatedValueX, animatedValueY) => {
    const {
      horizontalThreshold,
      verticalThreshold,
      onSwipedLeft,
      onSwipedRight,
      onSwipedTop,
      onSwipedBottom
    } = this.props;

    const isSwipingLeft = animatedValueX < -horizontalThreshold;
    const isSwipingRight = animatedValueX > horizontalThreshold;
    const isSwipingTop = animatedValueY < -verticalThreshold;
    const isSwipingBottom = animatedValueY > verticalThreshold;

    if (isSwipingRight) {
      return onSwipedRight;
    } else if (isSwipingLeft) {
      return onSwipedLeft;
    } else if (isSwipingTop) {
      return onSwipedTop;
    } else if (isSwipingBottom) {
      return onSwipedBottom;
    }
  };

  resetTopCard = cb => {
    Animated.spring(this.state.pan, {
      toValue: 0
    }).start(cb);
  };

  swipeBack = cb => {
    Animated.spring(this.state.previousCardY, {
      toValue: 0,
      friction: this.props.swipeBackFriction,
      duration: this.props.swipeBackAnimationDuration
    }).start(() => {
      this.decrementCardIndex(cb);
    });
  };

  swipeCard = onSwiped => {
    Animated.timing(this.state.pan, {
      toValue: {
        x: this._animatedValueX * 4.5,
        y: this._animatedValueY * 4.5
      },
      duration: this.props.swipeAnimationDuration
    }).start(() => {
      this.incrementCardIndex(onSwiped);
    });
  };

  zoomNextCard = () => {
    Animated.spring(this.state.scale, {
      toValue: 1,
      friction: this.props.zoomFriction,
      duration: this.props.zoomAnimationDuration
    }).start();
  };

  incrementCardIndex = onSwiped => {
    const { firstCardIndex } = this.state;
    let newCardIndex = firstCardIndex + 1;
    let swipedAllCards = false;

    if (newCardIndex === this.props.cards.length) {
      newCardIndex = 0;
      swipedAllCards = true;
    }

    this.onSwipedCallbacks(onSwiped, swipedAllCards);
    this.setCardIndex(newCardIndex, swipedAllCards);
  };

  decrementCardIndex = cb => {
    const { firstCardIndex } = this.state;
    const newCardIndex = firstCardIndex === 0
      ? this.props.cards.length - 1
      : firstCardIndex - 1;
    const swipedAllCards = false;

    this.onSwipedCallbacks(cb, swipedAllCards);
    this.setCardIndex(newCardIndex, swipedAllCards);
  };

  jumpToCardIndex = newCardIndex => {
    if (this.props.cards[newCardIndex]) {
      this.setCardIndex(newCardIndex, false);
    }
  };

  onSwipedCallbacks = (swipeDirectionCallback, swipedAllCards) => {
    let previousCardIndex = this.state.firstCardIndex;
    this.props.onSwiped(previousCardIndex);

    swipeDirectionCallback(previousCardIndex);
    if (swipedAllCards) {
      this.props.onSwipedAll();
    }
  };

  setCardIndex = (newCardIndex, swipedAllCards) => {
    this.setState(
      {
        firstCardIndex: newCardIndex,
        secondCardIndex: this.calculateSecondCardIndex(newCardIndex),
        previousCardIndex: this.calculatePreviousCardIndex(newCardIndex),
        swipedAllCards: swipedAllCards,
        panResponderLocked: false
      },
      this.resetPanAndScale
    );
  };

  resetPanAndScale = () => {
    this.state.pan.setValue({ x: 0, y: 0 });
    this.state.scale.setValue(this.props.secondCardZoom);
    this.state.previousCardX.setValue(this.props.previousCardInitialPositionX);
    this.state.previousCardY.setValue(this.props.previousCardInitialPositionY);
  };

  calculateSwipableCardStyle = () => {
    let opacity = this.props.animateOpacity ? this.interpolateOpacity() : 1;
    let rotation = this.interpolateRotation();

    return [
      styles.card,
      this.cardStyle,
      {
        zIndex: 3,
        opacity: opacity,
        transform: [
          { translateX: this.state.pan.x },
          { translateY: this.state.pan.y },
          { rotate: rotation }
        ]
      }
    ];
  };

  calculateSecondCardZoomStyle = () => {
    return [
      styles.card,
      this.cardStyle,
      {
        zIndex: 1,
        transform: [{ scale: this.state.scale }]
      }
    ];
  };

  calculateSwipeBackCardStyle = () => {
    return [
      styles.card,
      this.cardStyle,
      {
        zIndex: 4,
        transform: [
          { translateX: this.state.previousCardX },
          { translateY: this.state.previousCardY }
        ]
      }
    ];
  };

  interpolateOpacity = () => {
    const animatedValueX = Math.abs(this._animatedValueX);
    const animatedValueY = Math.abs(this._animatedValueY);
    let opacity;

    if (animatedValueX > animatedValueY) {
      opacity = this.state.pan.x.interpolate({
        inputRange: this.props.inputOpacityRangeX,
        outputRange: this.props.outputOpacityRangeX
      });
    } else {
      opacity = this.state.pan.y.interpolate({
        inputRange: this.props.inputOpacityRangeY,
        outputRange: this.props.outputOpacityRangeY
      });
    }

    return opacity;
  };

  interpolateRotation = () => {
    return this.state.pan.x.interpolate({
      inputRange: this.props.inputRotationRange,
      outputRange: this.props.outputRotationRange
    });
  };

  render() {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: this.props.backgroundColor,
            marginTop: this.props.marginTop,
            marginBottom: this.props.marginBottom
          }
        ]}
      >
        {this.renderChildren()}
        {this.renderFirstCard()}
        {this.renderSecondCard()}
        {this.renderSwipeBackCard()}
      </View>
    );
  }

  renderChildren() {
    const { childrenOnTop, children } = this.props;

    let zIndex = 1;
    if (childrenOnTop) {
      zIndex = 5;
    }

    return (
      <View style={[styles.childrenViewStyle, { zIndex: zIndex }]}>
        {children}
      </View>
    );
  }

  renderFirstCard = () => {
    const { firstCardIndex } = this.state;
    const { cards } = this.props;

    const swipableCardStyle = this.calculateSwipableCardStyle();
    const firstCardContent = cards[firstCardIndex];
    let firstCard = this.props.renderCard(firstCardContent);

    const notInfinite = !this.props.infinite;
    if (notInfinite && this.state.swipedAllCards) {
      return <Animated.View />;
    }

    return (
      <Animated.View
        style={swipableCardStyle}
        {...this._panResponder.panHandlers}
      >
        {firstCard}
      </Animated.View>
    );
  };

  renderSecondCard = () => {
    const { secondCardIndex } = this.state;
    const { cards, renderCard } = this.props;

    const secondCardZoomStyle = this.calculateSecondCardZoomStyle();
    const secondCardContent = cards[secondCardIndex];
    let secondCard = renderCard(secondCardContent);
    const notInfinite = !this.props.infinite;
    const lastCardOrSwipedAllCards =
      secondCardIndex === 0 || this.state.swipedAllCards;
    if (notInfinite && lastCardOrSwipedAllCards) {
      return <Animated.View />;
    }

    return (
      <Animated.View style={secondCardZoomStyle}>
        {secondCard}
      </Animated.View>
    );
  };

  renderSwipeBackCard = () => {
    const { previousCardIndex } = this.state;
    const { cards } = this.props;
    const previousCardContent = cards[previousCardIndex];
    const previousCardStyle = this.calculateSwipeBackCardStyle();
    const previousCard = this.props.renderCard(previousCardContent);
    return (
      <Animated.View style={previousCardStyle}>
        {previousCard}
      </Animated.View>
    );
  };
}

Swiper.propTypes = {
  cards: React.PropTypes.array.isRequired,
  childrenOnTop: React.PropTypes.bool,
  renderCard: React.PropTypes.func.isRequired,
  onSwipedAll: React.PropTypes.func,
  onSwiped: React.PropTypes.func,
  onSwipedLeft: React.PropTypes.func,
  onSwipedRight: React.PropTypes.func,
  onSwipedTop: React.PropTypes.func,
  onSwipedBottom: React.PropTypes.func,
  cardIndex: React.PropTypes.number,
  infinite: React.PropTypes.bool,
  secondCardZoom: React.PropTypes.number,
  zoomFriction: React.PropTypes.number,
  backgroundColor: React.PropTypes.string,
  marginTop: React.PropTypes.number,
  marginBottom: React.PropTypes.number,
  cardVerticalMargin: React.PropTypes.number,
  cardHorizontalMargin: React.PropTypes.number,
  outputRotationRange: React.PropTypes.array,
  inputRotationRange: React.PropTypes.array,
  animateOpacity: React.PropTypes.bool,
  inputOpacityRange: React.PropTypes.array,
  outputOpacityRange: React.PropTypes.array,
  verticalThreshold: React.PropTypes.number,
  horizontalThreshold: React.PropTypes.number,
  previousCardInitialPositionX: React.PropTypes.number,
  previousCardInitialPositionY: React.PropTypes.number,
  swipeAnimationDuration: React.PropTypes.number,
  swipeBackAnimationDuration: React.PropTypes.number,
  zoomAnimationDuration: React.PropTypes.number,
  swipeBackFriction: React.PropTypes.number,
  horizontalSwipe: React.PropTypes.bool,
  verticalSwipe: React.PropTypes.bool
};

Swiper.defaultProps = {
  cardIndex: 0,
  childrenOnTop: false,
  onSwiped: cardIndex => {
    console.log(cardIndex);
  },
  onSwipedLeft: cardIndex => {
    console.log("onSwipedLeft");
  },
  onSwipedRight: cardIndex => {
    console.log("onSwipedRight");
  },
  onSwipedTop: cardIndex => {
    console.log("onSwipedTop");
  },
  onSwipedBottom: cardIndex => {
    console.log("onSwipedBottom");
  },
  onSwipedAll: () => {
    console.log("onSwipedAll");
  },
  infinite: false,
  verticalThreshold: height / 5,
  horizontalThreshold: width / 4,
  secondCardZoom: 0.97,
  zoomFriction: 7,
  backgroundColor: "#4FD0E9",
  marginTop: 0,
  marginBottom: 0,
  cardVerticalMargin: 60,
  cardHorizontalMargin: 20,
  outputRotationRange: ["-10deg", "0deg", "10deg"],
  inputRotationRange: [-width / 2, 0, width / 2],
  animateOpacity: false,
  inputOpacityRangeX: [-width / 2, -width / 3, 0, width / 3, width / 2],
  outputOpacityRangeX: [0.8, 1, 1, 1, 0.8],
  inputOpacityRangeY: [-height / 2, -height / 3, 0, height / 3, height / 2],
  outputOpacityRangeY: [0.8, 1, 1, 1, 0.8],
  previousCardInitialPositionX: 0,
  previousCardInitialPositionY: -height,
  swipeAnimationDuration: 350,
  swipeBackAnimationDuration: 600,
  zoomAnimationDuration: 100,
  swipeBackFriction: 11,
  horizontalSwipe: true,
  verticalSwipe: true
};

export default Swiper;
