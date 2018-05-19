/*
 *  Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *  WSO2 Inc. licenses this file to you under the Apache License,
 *  Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Autosuggest from 'react-autosuggest';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
// Material UI Components
import TextField from 'material-ui/TextField';
import { MenuItem } from 'material-ui/Menu';
import Paper from 'material-ui/Paper';
// CSS
import '../../../../../../index.css';

/**
 * Styles related to this component
 */
const styles = {
    container: {
        flexGrow: 1,
        position: 'relative',
        width: '40%',
        height: 70,
        float: 'left',
    },
    suggestionsContainerOpen: {
        position: 'absolute',
        marginTop: 1,
        marginBottom: 3,
        left: 0,
        right: 0,
    },
    suggestion: {
        display: 'block',
    },
    suggestionsList: {
        margin: 0,
        padding: 0,
        listStyleType: 'none',
    },
    textField: {
        width: '100%',
    },
};

/**
 * Represents the output component of the business rule from scratch form,
 * which will contain output rule template selection, output configurations and input-as-output mappings
 */
export default class AutoCompleteProperty extends Component {
    constructor() {
        super();
        this.state = {
            value: '',
            suggestions: [],
        };
    }

    /* AutoSuggestion related functions [BEGIN] */

    getSuggestionValue(suggestion) {
        return suggestion.label;
    }

    getSuggestions(value) {
        const inputValue = value.trim().toLowerCase();
        const inputLength = inputValue.length;
        let count = 0;
        const suggestions = this.returnSuggestionsAsLabels();

        return inputLength === 0 ? [] :
            suggestions.filter((suggestion) => {
                const keep = count < 5 && suggestion.label.toLowerCase().slice(0, inputLength) === inputValue;
                if (keep) {
                    count += 1;
                }
                return keep;
            });
    }

    returnSuggestionsAsLabels() {
        return this.props.elements.map(element => ({ label: element }));
    }

    handleSuggestionsFetchRequested({ value }) {
        this.setState({
            suggestions: this.getSuggestions(value),
        });
    }

    renderSuggestionsContainer(options) {
        const { containerProps, children } = options;

        return (
            <Paper
                key={containerProps.key}
                id={containerProps.id}
                style={containerProps.style}
                ref={containerProps.ref}
                elevation={5}
                square
            >
                {children}
            </Paper>
        );
    }

    renderSuggestion(suggestion, { query, isHighlighted }) {
        const matches = match(suggestion.label, query);
        const parts = parse(suggestion.label, matches);

        return (
            <MenuItem selected={isHighlighted} component="div">
                <div>
                    {parts.map((part, index) => {
                        return part.highlight ?
                            (<span key={String(index)} style={{ fontWeight: 300 }}>
                                {part.text}
                            </span>) :
                            (<strong key={String(index)} style={{ fontWeight: 500 }}>
                                {part.text}
                            </strong>);
                    })}
                </div>
            </MenuItem>
        );
    }

    renderInput(inputProps) {
        const { autoFocus, value, ref } = inputProps;

        return (
            <TextField
                autoFocus={autoFocus}
                style={styles.textField}
                value={value}
                inputRef={ref}
                InputProps={{ inputProps }}
                disabled={this.props.disabled}
                error={this.props.error}
            />
        );
    }

    /* AutoSuggestion related functions [END] */

    render() {
        return (
            <Autosuggest
                theme={styles}
                renderInputComponent={e => this.renderInput(e)}
                suggestions={this.state.suggestions}
                onSuggestionsFetchRequested={e => this.handleSuggestionsFetchRequested(e)}
                renderSuggestionsContainer={this.renderSuggestionsContainer}
                getSuggestionValue={this.getSuggestionValue}
                renderSuggestion={this.renderSuggestion}
                inputProps={{
                    autoFocus: true,
                    autoSuggestStyles: styles,
                    placeholder: '',
                    // TODO refactor "x ? x : '' " type of things to "x || '' "
                    value: (this.props.value) || '',
                    onChange: (e, v) => this.props.onChange(v),
                }}
            />
        );
    }
}

AutoCompleteProperty.propTypes = {
    elements: PropTypes.arrayOf(PropTypes.string).isRequired,
    disabled: PropTypes.bool.isRequired,
    error: PropTypes.bool.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
};
