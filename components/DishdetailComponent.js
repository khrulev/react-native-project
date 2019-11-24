import React, { Component } from 'react';
import { Text, View, ScrollView, FlatList, StyleSheet, Picker, Switch, Button, Modal } from 'react-native';

import { DISHES } from '../shared/dishes';
import { COMMENTS } from '../shared/comments';
import { Card, Icon, Input, TextInput } from 'react-native-elements';
import { connect } from 'react-redux';
import { baseUrl } from '../shared/baseUrl';
import { postFavorite, postComment } from '../redux/ActionCreators';
import { Rating, AirbnbRating } from 'react-native-elements';
import * as Animatable from 'react-native-animatable';

const styles = StyleSheet.create({
    iconDish: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        flexDirection: "row"
    }
});

const mapStateToProps = state => {
    return {
        dishes: state.dishes,
        comments: state.comments,
        favorites: state.favorites
    }
}

const mapDispatchToProps = dispatch => ({
    postFavorite: (dishId) => dispatch(postFavorite(dishId)),
    postComment: (comment) => dispatch(postComment(comment))
})

function RenderComments(props) {

    const comments = props.comments;

    const renderCommentItem = ({ item, index }) => {

        return (
            <View key={index} style={{ margin: 10 }}>
                <Text style={{ fontSize: 14 }}>{item.comment}</Text>
                <Text style={{ fontSize: 12 }}>{item.rating} Stars</Text>
                <Text style={{ fontSize: 12 }}>{'-- ' + item.author + ', ' + item.date} </Text>
            </View>
        );
    };

    return (
        <Animatable.View animation="fadeInUp" duration={2000} delay={1000}>
            <Card title='Comments' >
                <FlatList
                    data={comments}
                    renderItem={renderCommentItem}
                    keyExtractor={item => item.id.toString()}
                />
            </Card>
        </Animatable.View>
    );
}

function RenderDish(props) {

    const dish = props.dish;

    if (dish != null) {
        return (
            <Animatable.View animation="fadeInDown" duration={2000} delay={1000}>
                <Card
                    featuredTitle={dish.name}
                    image={{ uri: baseUrl + dish.image }}>
                    <Text style={{ margin: 10 }}>
                        {dish.description}
                    </Text>
                    <View style={styles.iconDish}>
                        <Icon
                            raised
                            reverse
                            name={props.favorite ? 'heart' : 'heart-o'}
                            type='font-awesome'
                            color='#f50'
                            onPress={() => props.favorite ? console.log('Already favorite') : props.onPress()}
                        />
                        <Icon
                            raised
                            reverse
                            name='pencil'
                            type='font-awesome'
                            color='#512DA8'
                            onPress={() => props.onAddCommentPress()}
                        />
                    </View>
                </Card>
            </Animatable.View>
        );
    }
    else {
        return (<View></View>);
    }
}

class Dishdetail extends Component {

    constructor(props) {

        super(props);

        this.state = {
            dishes: DISHES,
            comments: COMMENTS,
            favorites: [],
            showModal: false,
            commentText: "",
            author: "",
            rating: 0,
        };

        this.handleChangeAuthor = this.handleChangeAuthor.bind(this);
        this.handleChangeComment = this.handleChangeComment.bind(this);
        this.handleFinishRating = this.handleFinishRating.bind(this);

    }

    markFavorite(dishId) {
        this.props.postFavorite(dishId);
    }

    handleComment(dishId, commentId, rating, textComment, author) {
        var commentDate = new Date().toISOString();

        const newComment = {
            id: commentId,
            dishId: dishId,
            rating: rating,
            comment: textComment,
            author: author,
            date: commentDate
        }

        this.props.postComment(newComment);
        this.toggleModal()
    }

    static navigationOptions = {
        title: 'Dish Details'
    };

    toggleModal() {
        this.setState({ showModal: !this.state.showModal });
    }

    resetForm() {
        this.setState({
            showModal: false,
            commentText: "",
            author: "",
            rating: 0
        });
    }

    handleChangeAuthor(event) {
        this.setState({ author: event.nativeEvent.text });
    }

    handleChangeComment(event) {
        this.setState({ commentText: event.nativeEvent.text });
    }

    handleFinishRating(event) {
        this.setState({ rating: event });
    }


    render() {
        const dishId = this.props.navigation.getParam('dishId', '');
        return (
            <ScrollView>
                <RenderDish dish={this.props.dishes.dishes[+dishId]}
                    favorite={this.props.favorites.some(el => el === dishId)}
                    onPress={() => this.markFavorite(dishId)}
                    onAddCommentPress={() => this.toggleModal()}
                />
                <RenderComments comments={this.props.comments.comments.filter((comment) => comment.dishId === dishId)} />
                <Modal animationType={"slide"} transparent={false}
                    visible={this.state.showModal}
                    onDismiss={() => this.toggleModal()}
                    onRequestClose={() => this.toggleModal()}>
                    <View style={styles.modal}>
                        <Rating showRating
                            fractions={0}
                            startingValue={0}
                            count={5}
                            onFinishRating={this.handleFinishRating}
                        />
                        <Input
                            placeholder='Author'
                            leftIcon={{ type: 'font-awesome', name: 'user' }}
                            onChange={this.handleChangeAuthor} />
                        <Text></Text>
                        <Input
                            placeholder='Comment'
                            leftIcon={{ type: 'font-awesome', name: 'comment' }}
                            onChange={this.handleChangeComment} />
                        <Text></Text>
                        <Button
                            onPress={() => {
                                this.handleComment(
                                    dishId,
                                    this.state.comments.length,
                                    this.state.rating,
                                    this.state.commentText,
                                    this.state.author);
                                this.toggleModal();
                                this.resetForm();
                            }}
                            color="#512DA8"
                            title="SUBMIT"
                        />
                        <Text></Text>
                        <Text></Text>
                        <Button
                            onPress={() => {
                                this.toggleModal();
                                this.resetForm();
                            }}
                            color="#b2b2b2"
                            title="CANCEL"
                        />
                    </View>
                </Modal>
            </ScrollView>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Dishdetail);