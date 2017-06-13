import React from "react";
import PropTypes from "prop-types";
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
      panResponderLocked: false,
      labelType: 'none'
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

    this.customCardStyle = this.props.cardStyle;
  };

  initializePanResponder = () => {
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (event, gestureState) => true,
      onMoveShouldSetPanResponder: (event, gestureState) => true,
      onPanResponderGrant: this.onPanResponderGrant,
      onPanResponderMove: this.onPanResponderMove,
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

  onPanResponderMove = (event, gestureState) => {

    const { horizontalThreshold, verticalThreshold } = this.props;
    const isSwipingLeft = this._animatedValueX < -horizontalThreshold;
    const isSwipingRight = this._animatedValueX > horizontalThreshold;
    const isSwipingTop = this._animatedValueY < -verticalThreshold;
    const isSwipingBottom = this._animatedValueY > verticalThreshold;

    console.log(this._animatedValueX, this._animatedValueY, horizontalThreshold, verticalThreshold);

    if (isSwipingRight) {
      this.setState({labelType: 'right'});
    } else if (isSwipingLeft) {
      this.setState({labelType: 'left'});
    } else if (isSwipingTop) {
      this.setState({labelType: 'top'});
    } else if (isSwipingBottom) {
      this.setState({labelType: 'bottom'});
    } else {
      this.setState({labelType: 'none'});
    }

    return Animated.event([null, this.createAnimatedEvent()])(event,gestureState);
  }

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

  validPanResponderRelease = () => {
    const {
      horizontalThreshold,
      verticalThreshold,
      disableBottomSwipe,
      disableLeftSwipe,
      disableRightSwipe,
      disableTopSwipe
    } = this.props;

    const isSwipingLeft = this._animatedValueX < -horizontalThreshold;
    const isSwipingRight = this._animatedValueX > horizontalThreshold;
    const isSwipingTop = this._animatedValueY < -verticalThreshold;
    const isSwipingBottom = this._animatedValueY > verticalThreshold;

    return (isSwipingLeft && !disableLeftSwipe) ||
      (isSwipingRight && !disableRightSwipe) ||
      (isSwipingTop && !disableTopSwipe) ||
      (isSwipingBottom && !disableBottomSwipe);
  };

  onPanResponderRelease = (e, gestureState) => {
    const { horizontalThreshold, verticalThreshold } = this.props;
    const animatedValueX = Math.abs(this._animatedValueX);
    const animatedValueY = Math.abs(this._animatedValueY);
    const isSwiping = animatedValueX > horizontalThreshold ||
      animatedValueY > verticalThreshold;

    if (isSwiping && this.validPanResponderRelease()) {
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
    this.setState({labelType: 'none'});
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

  calculateOverlayLabelStyle = () => {
    let externalStyles = {}, dynamicStyles = {};
    switch(this.state.labelType) {
      case 'bottom':
        externalStyles = styles.overlayLabelBottom;
      break;

      case 'left':
        externalStyles = styles.overlayLabelLeft;
      break;

      case 'right':
        externalStyles = styles.overlayLabelRight;
      break;

      case 'top':
        externalStyles = styles.overlayLabelTop;
      break;

      default:
        externalStyles = styles.hideOverlayLabel;
    }
    if (this.state.labelType!=='none') {
      dynamicStyles = {
        backgroundColor: this.props.overlayLabels[this.state.labelType].backgroundColor,
        borderColor: this.props.overlayLabels[this.state.labelType].borderColor,
        color: '#FFF',
        borderWidth: 1
      };
    }
    return [externalStyles, dynamicStyles];
  }

  calculateOverlayLabelWrapperStyle = () => {
    let dynamicStyles = {};
    switch(this.state.labelType) {
      case 'bottom':
        dynamicStyles = {
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        };
      break;

      case 'left':
        dynamicStyles = {
          flexDirection: 'column',
          alignItems: 'flex-end',
          justifyContent: 'flex-start',
          marginTop: 30,
          marginLeft: -30
        };
      break;

      case 'right':
        dynamicStyles = {
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          marginTop: 30,
          marginLeft: 30
        };
      break;

      case 'top':
        dynamicStyles = {
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        };
      break;
    }
    let opacity = this.props.animateOverlayLabelsOpacity ? this.interpolateOverlayLabelsOpacity() : 1;
    return [styles.overlayLabelWrapper, dynamicStyles, {opacity}];
  }

  calculateSwipableCardStyle = () => {
    let opacity = this.props.animateCardOpacity ? this.interpolateCardOpacity() : 1;
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
      },
      this.customCardStyle
    ];
  };

  calculateSecondCardZoomStyle = () => [
    styles.card,
    this.cardStyle,
    {
      zIndex: 1,
      transform: [{ scale: this.state.scale }]
    },
    this.customCardStyle
  ];

  calculateSwipeBackCardStyle = () => [
    styles.card,
    this.cardStyle,
    {
      zIndex: 4,
      transform: [
        { translateX: this.state.previousCardX },
        { translateY: this.state.previousCardY }
      ]
    },
    this.customCardStyle
  ];

  interpolateCardOpacity = () => {
    const animatedValueX = Math.abs(this._animatedValueX);
    const animatedValueY = Math.abs(this._animatedValueY);
    let opacity;

    if (animatedValueX > animatedValueY) {
      opacity = this.state.pan.x.interpolate({
        inputRange: this.props.inputCardOpacityRangeX,
        outputRange: this.props.outputCardOpacityRangeX
      });
    } else {
      opacity = this.state.pan.y.interpolate({
        inputRange: this.props.inputCardOpacityRangeY,
        outputRange: this.props.outputCardOpacityRangeY
      });
    }

    return opacity;
  };

  interpolateOverlayLabelsOpacity = () => {
    const animatedValueX = Math.abs(this._animatedValueX);
    const animatedValueY = Math.abs(this._animatedValueY);
    let opacity;

    if (animatedValueX > animatedValueY) {
      opacity = this.state.pan.x.interpolate({
        inputRange: this.props.inputOverlayLabelsOpacityRangeX,
        outputRange: this.props.outputOverlayLabelsOpacityRangeX
      });
    } else {
      opacity = this.state.pan.y.interpolate({
        inputRange: this.props.inputOverlayLabelsOpacityRangeY,
        outputRange: this.props.outputOverlayLabelsOpacityRangeY
      });
    }

    return opacity;
  }

  interpolateRotation = () => this.state.pan.x.interpolate({
    inputRange: this.props.inputRotationRange,
    outputRange: this.props.outputRotationRange
  });

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
    let renderOverlayLabel = this.renderOverlayLabel();

    const notInfinite = !this.props.infinite;
    if (notInfinite && this.state.swipedAllCards) {
      return <Animated.View />;
    }

    return (
      <Animated.View
        style={swipableCardStyle}
        {...this._panResponder.panHandlers}
      >
        {renderOverlayLabel}
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

  renderOverlayLabel = () => this.state.labelType!=='none' ?
      (<Animated.View style={this.calculateOverlayLabelWrapperStyle()}>
        <Text style={this.calculateOverlayLabelStyle()}>
          {this.props.overlayLabels[this.state.labelType].title}
        </Text>
      </Animated.View>)
    : null
}

Swiper.propTypes = {
  animateCardOpacity: PropTypes.bool,
  animateOverlayLabelsOpacity: PropTypes.bool,
  backgroundColor: PropTypes.string,
  cardHorizontalMargin: PropTypes.number,
  cardIndex: PropTypes.number,
  cardStyle: PropTypes.object,
  cardVerticalMargin: PropTypes.number,
  cards: PropTypes.array.isRequired,
  childrenOnTop: PropTypes.bool,
  disableBottomSwipe: PropTypes.bool,
  disableLeftSwipe: PropTypes.bool,
  disableRightSwipe: PropTypes.bool,
  disableTopSwipe: PropTypes.bool,
  horizontalSwipe: PropTypes.bool,
  horizontalThreshold: PropTypes.number,
  infinite: PropTypes.bool,
  inputCardOpacityRange: PropTypes.array,
  inputRotationRange: PropTypes.array,
  marginBottom: PropTypes.number,
  marginTop: PropTypes.number,
  onSwiped: PropTypes.func,
  onSwipedAll: PropTypes.func,
  onSwipedBottom: PropTypes.func,
  onSwipedLeft: PropTypes.func,
  onSwipedRight: PropTypes.func,
  onSwipedTop: PropTypes.func,
  outputCardOpacityRange: PropTypes.array,
  outputRotationRange: PropTypes.array,
  overlayLabels: PropTypes.object,
  previousCardInitialPositionX: PropTypes.number,
  previousCardInitialPositionY: PropTypes.number,
  renderCard: PropTypes.func.isRequired,
  secondCardZoom: PropTypes.number,
  swipeAnimationDuration: PropTypes.number,
  swipeBackAnimationDuration: PropTypes.number,
  swipeBackFriction: PropTypes.number,
  verticalSwipe: PropTypes.bool,
  verticalThreshold: PropTypes.number,
  zoomAnimationDuration: PropTypes.number,
  zoomFriction: PropTypes.number
};

Swiper.defaultProps = {
  animateCardOpacity: false,
  animateOverlayLabelsOpacity: false,
  backgroundColor: "#4FD0E9",
  cardHorizontalMargin: 20,
  cardIndex: 0,
  cardStyle: {},
  cardVerticalMargin: 60,
  childrenOnTop: false,
  disableBottomSwipe: false,
  disableLeftSwipe: false,
  disableRightSwipe: false,
  disableTopSwipe: false,
  horizontalSwipe: true,
  horizontalThreshold: width / 4,
  infinite: false,
  inputCardOpacityRangeX: [-width / 2, -width / 3, 0, width / 3, width / 2],
  inputCardOpacityRangeY: [-height / 2, -height / 3, 0, height / 3, height / 2],
  inputOverlayLabelsOpacityRangeX: [-width / 3, -width / 4, 0, width / 4, width / 3],
  inputOverlayLabelsOpacityRangeY: [-height / 4, -height / 5, 0, height / 5, height / 4],
  inputRotationRange: [-width / 2, 0, width / 2],
  marginBottom: 0,
  marginTop: 0,
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
  outputCardOpacityRangeX: [0.8, 1, 1, 1, 0.8],
  outputCardOpacityRangeY: [0.8, 1, 1, 1, 0.8],
  outputOverlayLabelsOpacityRangeX: [1, 0, 0, 0, 1],
  outputOverlayLabelsOpacityRangeY: [1, 0, 0, 0, 1],
  outputRotationRange: ["-10deg", "0deg", "10deg"],
  overlayLabels: {
    bottom: {
      title: 'BLEAH',
      backgroundColor: 'rgba(148,108,140,0.75)',
      borderColor: '#946C8C'
    },
    left: {
      title: 'NOPE',
      backgroundColor: 'rgba(74,35,89,0.75)',
      borderColor: '#4A2359'
    },
    right: {
      title: 'LIKE',
      backgroundColor: 'rgba(250,159,140,0.75)',
      borderColor: '#FA9F8C'
    },
    top: {
      title: 'SUPER LIKE',
      backgroundColor: 'rgba(255,195,123,0.75)',
      borderColor: '#FFC37B'
    }
  },
  previousCardInitialPositionX: 0,
  previousCardInitialPositionY: -height,
  secondCardZoom: 0.97,
  swipeAnimationDuration: 350,
  swipeBackAnimationDuration: 600,
  swipeBackFriction: 11,
  verticalSwipe: true,
  verticalThreshold: height / 5,
  zoomAnimationDuration: 100,
  zoomFriction: 7
};

export default Swiper;
