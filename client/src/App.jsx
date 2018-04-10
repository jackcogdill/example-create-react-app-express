/* eslint arrow-parens: 0 */
import React, { Component } from 'react';
import fetch from 'isomorphic-fetch';
import InfiniteScroll from 'react-infinite-scroller';

import './App.css';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            images: [],
            header: '',
            hasPrev: false,
            hasNext: false,
            n: 0,
        };
    }

    componentDidMount() {
        this.update(0);
        document.addEventListener('keydown', this.handleKeyDown);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    callApi = async (n) => {
        const response = await fetch(`/api/manga?n=${n}`);
        const body = await response.json();

        if (response.status !== 200) throw Error(body.message);
        if (body.error) throw Error(body.error);

        return body;
    };

    update = (diff) => {
        const { n } = this.state;
        this.callApi(n + diff)
            .then(res => {
                console.dir(res);
                const { data, title, header, hasPrev, hasNext } = res;
                const image = (
                    <img className="strip-img" alt={title} title={title} src={`/images/${data}`} />
                );

                this.setState(prevState => ({
                    images: [...prevState.images, image],
                    header,
                    hasPrev,
                    hasNext,
                    n: n + diff,
                }));
            })
            .catch(err => console.log(err));
    }

    next = () => {
        this.update(1);
    }

    prev = () => {
        this.update(-1);
    }

    handleKeyDown = (e) => {
        switch (e.keyCode) {
            case 37: // Left arrow
            case 72: // h
                this.prev();
                break;
            case 39: // Right arrow
            case 76: // l
                this.next();
                break;
            default:
                break;
        }
    }

    render() {
        const { state, prev, next } = this;
        const { images, hasPrev, hasNext } = state;

        return (
            <div className="App">
                <div className="strip-wrap">
                    <InfiniteScroll
                        pageStart={0}
                        loadMore={next}
                        hasMore={hasNext}
                        loader={<div className="loader" key={0}>Loading...</div>}
                    >
                        {images}
                    </InfiniteScroll>
                </div>
            </div>
        );
    }
}

export default App;
