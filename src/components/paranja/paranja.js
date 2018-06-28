/** @jsx h */

import { h, Component } from 'preact';

import {h} from 'preact';
import cl from 'classnames';

import './paranja.less';

export default function Paranja(props) {
    return <div class={cl('paranja', {paranja_visible: props.visible})}></div>;
}
