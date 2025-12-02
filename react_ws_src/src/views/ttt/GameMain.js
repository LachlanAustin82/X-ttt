import React, {Component} from 'react'

import io from 'socket.io-client'

import TweenMax from 'gsap'

import rand_arr_elem from '../../helpers/rand_arr_elem'
import rand_to_fro from '../../helpers/rand_to_fro'

const cellId = (rowIx, colIx) => `${rowIx}-${colIx}`

export default class GameMain extends Component {

	constructor (props) {
		super(props)

		const board = Array.from({length: this.props.boardSize})
			.map(() => Array.from({length: this.props.boardSize}))


		if (this.props.game_type != 'live')
			this.state = {
				board,
				next_turn_ply: true,
				game_play: true,
				game_stat: 'Start game'
			}
		else {
			this.sock_start()

			this.state = {
				board,
				next_turn_ply: true,
				game_play: false,
				game_stat: 'Connecting'
			}
		}
	}

//	------------------------	------------------------	------------------------

	componentDidMount () {
    	TweenMax.from('#game_stat', 1, {display: 'none', opacity: 0, scaleX:0, scaleY:0, ease: Power4.easeIn})
    	TweenMax.from('#game_board', 1, {display: 'none', opacity: 0, x:-200, y:-200, scaleX:0, scaleY:0, ease: Power4.easeIn})
	}

//	------------------------	------------------------	------------------------
//	------------------------	------------------------	------------------------

	sock_start () {

		this.socket = io(app.settings.ws_conf.loc.SOCKET__io.u);

		this.socket.on('connect', function(data) {
			const { boardSize } = this.props

			this.socket.emit('new player', { name: app.settings.curr_user.name, boardSize });

		}.bind(this));

		this.socket.on('pair_players', function(data) { 
			// console.log('paired with ', data)

			this.setState({
				next_turn_ply: data.mode=='m',
				game_play: true,
				game_stat: 'Playing with ' + data.opp.name
			})

		}.bind(this));


		this.socket.on('opp_turn', this.turn_opp_live.bind(this));



	}

//	------------------------	------------------------	------------------------
//	------------------------	------------------------	------------------------

	componentWillUnmount () {

		this.socket && this.socket.disconnect();
	}

//	------------------------	------------------------	------------------------

	render () {
		const clickCell = this.click_cell.bind(this)

		const getCellClass = (rowIx, colIx) => {
			const className = []

			if ( rowIx > 0 && rowIx < this.props.boardSize - 1 ) {
				className.push('hbrd')
			}
			if ( colIx > 0 && colIx < this.props.boardSize - 1 ) {
				className.push('vbrd')
			}

			return className.join(' ')
		}

		return (
			<div id='GameMain' className="game-main">

				<h1>Play {this.props.game_type}</h1>

				<div id="game_stat">
					<div id="game_stat_msg">{this.state.game_stat}</div>
					{this.state.game_play && <div id="game_turn_msg">{this.state.next_turn_ply ? 'Your turn' : 'Opponent turn'}</div>}
				</div>

				<div id="game_board">
					<table>
					<tbody>
					{this.state.board.map((row, rowIx) => (
						<tr>
							{row.map((cell, colIx) => (
								<td
									id={`game_board-${rowIx}-${colIx}`}
									ref={cellId(rowIx, colIx)}
									onClick={() => clickCell(rowIx, colIx)}
									className={getCellClass(rowIx, colIx)}
								>
									{' '}
										{cell==='x' && <i className="fa fa-times fa-5x"></i>}
										{cell==='o' && <i className="fa fa-circle-o fa-5x"></i>}
									{' '}
								</td>
							))}
						</tr>
					))}
					</tbody>
					</table>
				</div>

				<button type='submit' onClick={this.end_game.bind(this)} className='button'><span>End Game <span className='fa fa-caret-right'></span></span></button>

			</div>
		)
	}

//	------------------------	------------------------	------------------------
//	------------------------	------------------------	------------------------

	click_cell (rowIx, colIx) {
		if (!this.state.next_turn_ply || !this.state.game_play) return

		if (this.state.board[rowIx][colIx]) return

		if (this.props.game_type !== 'live')
			this.turn_ply_comp(rowIx, colIx)
		else
			this.turn_ply_live(rowIx, colIx)
	}

//	------------------------	------------------------	------------------------
//	------------------------	------------------------	------------------------

	turn_ply_comp (rowIx, colIx) {
		const { board } = this.state
		board[rowIx][colIx] = 'x'

		TweenMax.from(this.refs[cellId(rowIx, colIx)], 0.7, {opacity: 0, scaleX:0, scaleY:0, ease: Power4.easeOut})

		this.state.board = board
		this.check_turn({rowIx, colIx})
	}

//	------------------------	------------------------	------------------------

	turn_comp () {
		const { board } = this.state
		let empty_cells_arr = []

		this.state.board.forEach((row, rowIx) => {
			row.forEach((value, colIx) => {
				if ( !value ) {
					empty_cells_arr.push({rowIx, colIx})
				}
			})
		})

		const { rowIx, colIx } = rand_arr_elem(empty_cells_arr)
		board[rowIx][colIx] = 'o'

		TweenMax.from(this.refs[cellId(rowIx, colIx)], 0.7, {opacity: 0, scaleX:0, scaleY:0, ease: Power4.easeOut})

		this.state.board = board

		this.check_turn({rowIx, colIx})
	}


//	------------------------	------------------------	------------------------
//	------------------------	------------------------	------------------------

	turn_ply_live (rowIx, colIx) {
		const { board } = this.state
		board[rowIx][colIx] = 'x'

		TweenMax.from(this.refs[cellId(rowIx, colIx)], 0.7, {opacity: 0, scaleX:0, scaleY:0, ease: Power4.easeOut})

		this.socket.emit('ply_turn', { rowIx, colIx});
		this.state.board = board

		this.check_turn({rowIx, colIx})
	}

//	------------------------	------------------------	------------------------

	turn_opp_live (data) {
		const { rowIx, colIx } = data
		const { board } = this.state
		board[rowIx][colIx] = 'o'

		TweenMax.from(this.refs[cellId(rowIx, colIx)], 0.7, {opacity: 0, scaleX:0, scaleY:0, ease: Power4.easeOut})

		this.state.board = board

		this.check_turn(data)
	}

//	------------------------	------------------------	------------------------
//	------------------------	------------------------	------------------------
//	------------------------	------------------------	------------------------

	checkWin (lastMove) {
		const { board } = this.state
		const { boardSize } = this.props
		let winCells = []

		// Walk along a line of the board and check for 3 in a row
		const checkLine = (rowInc, colInc) => {
			let lastCell = null
			winCells = []

			// Calculate the upper and lower bounds of the line we are going to walk
			// The line bounds won't be more than 2 cells in either direction from the last move
			// Upper bound will be one more step than that
			// 	- don't want to terminate before checking the last cell in the line
			const lowerRowBound = lastMove.rowIx - (2 * rowInc)
			const upperRowBound = lastMove.rowIx + (3 * rowInc)
			const lowerColBound = lastMove.colIx - (2 * colInc)
			const upperColBound = lastMove.colIx + (3 * colInc)

			for (
				let rowIx = lowerRowBound, colIx = lowerColBound;
				rowIx !== upperRowBound || colIx !== upperColBound;
				rowIx += rowInc, colIx += colInc
			) {
				if ( rowIx < 0 || colIx < 0 || rowIx >= boardSize || colIx >= boardSize ) {
					// This is not a cell on the table, skip it
					continue
				}

				const cell = board[rowIx][colIx]
				if ( lastCell !== cell ) {
					// Doesn't match the last cell in sequence, so reset
					lastCell = cell
					winCells = cell ? [{rowIx, colIx}] : []
				}
				else if ( lastCell ) {
					// Matches the last cell in sequence, so add to sequence
					winCells.push({rowIx, colIx})
					if ( winCells.length === 3 ) {
						// Immediately break if we detect a win condition
						return true
					}
				}
				else {
					// Otherwise its another empty cell: no-op
				}
			}

			return false
		}

		if (
			checkLine(0, 1) || // Check the current row
			checkLine(1, 0) || // Check the current column
			checkLine(1, 1) || // Check the current forward diagonal
			checkLine(1, -1)   // Check the current backward diagonal
		) {
			return winCells
		}

		return undefined
	}

	checkDraw () {
		return this.state.board.every((row) => {
			return row.every((col) => !!col)
		})
	}

	check_turn (lastMove) {
		const { board } = this.state

		if (this.props.game_type!='live')
			this.state.game_stat = 'Play'

		const winCells = this.checkWin(lastMove)

		if (winCells) {
		
			this.refs[cellId(winCells[0].rowIx, winCells[0].colIx)].classList.add('win')
			this.refs[cellId(winCells[1].rowIx, winCells[1].colIx)].classList.add('win')
			this.refs[cellId(winCells[2].rowIx, winCells[2].colIx)].classList.add('win')

			TweenMax.killAll(true)
			TweenMax.from('td.win', 1, {opacity: 0, ease: Linear.easeIn})

			const { rowIx, colIx } = winCells[0]
			const youWin = board[rowIx][colIx] === 'x'

			this.setState({
				game_stat: youWin ? 'You Win' : 'Opponent Wins',
				game_play: false
			})

			this.socket && this.socket.disconnect();

		} else if (this.checkDraw()) {
		
			this.setState({
				game_stat: 'Draw',
				game_play: false
			})

			this.socket && this.socket.disconnect();

		} else {
			this.props.game_type!='live' && this.state.next_turn_ply && setTimeout(this.turn_comp.bind(this), rand_to_fro(500, 1000));

			this.setState({
				next_turn_ply: !this.state.next_turn_ply
			})
		}
		
	}

//	------------------------	------------------------	------------------------

	end_game () {
		this.socket && this.socket.disconnect();

		this.props.onEndGame()
	}



}
