import React, { Component } from 'react';
import axios from 'axios/index';
import Cookies from 'universal-cookie';
import { v4 as uuid } from 'uuid';

import Message from './Message';

const cookies = new Cookies();

class Chatbot extends Component {
    messagesEnd;
    talkInput;

    constructor(props) {
        super (props);
        // This binding is necessary to make `this` work in the callback
        this._handleInputKeyPress = this._handleInputKeyPress.bind(this);
        this.state = {
            messages: []
        }

        if (cookies.get('userID') === undefined) {
            cookies.set('userID', uuid(), { path: '/' });    
        }
        console.log(cookies.get('userID'));
    }

    async df_text_query (queryText) {
        let msg;
        let says = {
            speaks: 'user',
            msg: {
                text : {
                    text: queryText
                }
            }
        }
        this.setState({ messages: [...this.state.messages, says]});
        const res = await axios.post('/api/df_text_query',  {text: queryText, userID: cookies.get('userID')});

         if (res.data.fulfillmentMessages ) {
            for (let i = 0; i < res.data.fulfillmentMessages.length; i++) {
                console.log(JSON.stringify(msg));
                msg = res.data.fulfillmentMessages[i];
                says = {
                    speaks: 'bot',
                    msg: msg
                }
                this.setState({ messages: [...this.state.messages, says]});
            }
        }
    };

    async df_event_query(eventName) {
        const res = await axios.post('/api/df_event_query',  {event: eventName, userID: cookies.get('userID')});
       let msg, says = {};
        if (res.data.fulfillmentMessages ) {
           for (let i=0; i<res.data.fulfillmentMessages.length; i++) {
               msg = res.data.fulfillmentMessages[i];
               says = {
                   speaks: 'bot',
                   msg: msg
               }
                this.setState({ messages: [...this.state.messages, says]});
           }
       }
   };

   componentDidMount() {
       this.df_event_query('Welcome');
   }

   componentDidUpdate() {   
        this.scrollToBottom();
        if ( this.talkInput ) {
            this.talkInput.focus();
        }
   }

   renderMessages(stateMessages) {
       if (stateMessages) {
           return stateMessages.map((message, i) => {
               if (message.msg && message.msg.text && message.msg.text.text) {
                return <Message key={i} speaks={message.speaks} text={message.msg.text.text} />;
               } else {

               }
           });
       } else {
           return null;
       }
   }

    _handleInputKeyPress(e) {
       if (e.key === 'Enter') {
            this.df_text_query(e.target.value);
            e.target.value = '';
        }
    }

    render () {
        return (
            <div style = {{ height: 400, width: 400, float: 'right' }}>
                <div id="chatbot" style={{ height: '100%', width: '100%', overflow: 'auto' }}>
                    <h2>Chatbot</h2>
                    {this.renderMessages(this.state.messages)}
                    <div ref = {(el) => { this.messagesEnd = el; }} 
                        style={{ float: 'left', clear: "both" }}>

                    </div>
                    <input type="text" ref={(input) => { this.talkInput = input; }} onKeyPress={this._handleInputKeyPress} autoFocus />
                </div>
            </div>
        )
    }

    scrollToBottom = () => {
        this.messagesEnd.scrollIntoView({ behavior: "smooth" });
    }
}

export default Chatbot;