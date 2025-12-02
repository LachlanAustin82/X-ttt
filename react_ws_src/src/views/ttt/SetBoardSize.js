import React, {Component} from 'react'

export default class SetBoardType extends Component {
    constructor(props) {
        super(props)
        this.state = { boardSize: 3 }
    }

    render() {
        const handleSelect = (e) => {
            const boardSize = parseInt(e.target.value)
            this.setState(state => ({...state, boardSize}))
        }

        const handleContinue = () => {
            this.props.onSetBoardSize(this.state.boardSize)
        }

        return (
            <div id="SetBoardSize">
                <h1>Choose Board Size</h1>

                <div className="input_holder left">
                    <label>Board Size</label>
                    <select className="input" value={this.state.boardSize} onChange={handleSelect}>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                    </select>
                </div>

                <button type='submit' onClick={handleContinue} className='button long'>
                    <span>Continue</span>
                </button>
            </div>
        )
    }
}

SetBoardType.propTypes = {
    onSetBoardSize: React.PropTypes.func
}