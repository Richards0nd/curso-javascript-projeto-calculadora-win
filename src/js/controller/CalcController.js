class CalcController {

	constructor() {
		this._audio = new Audio('click.mp3')
		this._audioOnOff = false

		this._lastOperator = ''
		this._lastNumber = ''
		this._operation = [];

		this._displayCalcEL = document.querySelector("#display")
		this.initialize()
		this.initButtonsEvents()
		this.initKeyboard()
	}

	initialize() {
		this.setLastNumberToDisplay()
		this.pasteFromClipboard()
	}

	playAudio() {
		if (this._audioOnOff) {
			this._audio.currentTime = 0
			this._audio.play()
		}
	}

	addEventListenerAll(element, events, fn) {
		events.split(' ').forEach(event => {
			element.addEventListener(event, fn, false)
		})
	}

	setError() {
		this.displayCalc = 'ERRO'
	}

	clearAll() {
		this._operation = []
		this._lastNumber = ''
		this._lastOperator = ''
		this.setLastNumberToDisplay()
	}
	clearEntry() {
		this._operation.pop()
		this.setLastNumberToDisplay()
	}

	getLastOperation() {
		return this._operation[this._operation.length - 1]
	}

	setLastOperation(val) {
		this._operation[this._operation.length - 1] = val
	}

	isOperator(val) {
		return (['+', '-', '*', '%', '/'].indexOf(val) > -1)
	}

	getResult() {
		try {
			return eval(this._operation.join(''))
		} catch {
			setTimeout(()=>{
				this.setError()
			}, 10)
		}
	}

	calc() {
		let last
		this._lastOperator = this.getLastItem()

		if (this._operation.length < 3) {
			let fistItem = this._operation[0]
			this._operation = [fistItem, this._lastOperator, this._lastNumber]
		}

		if (this._operation.length > 3) {
			last = this._operation.pop()
			this._lastNumber = this.getResult()
		} else if (this._operation.length == 3) {
			this._lastNumber = this.getLastItem(false)
		}

		let result = this.getResult()
		if (last == '%') {
			result /= 100
			this._operation = [result]
		} else {
			this._operation = [result]
			if (last) this._operation.push(last)
		}
		this.setLastNumberToDisplay()
	}

	pushOperation(val) {
		this._operation.push(val)
		if (this._operation.length > 3) {
			this.calc()
		}
	}

	getLastItem(isOperator = true) {
		let lastItem
		this._operation.forEach(i => {
			if (this.isOperator(i) == isOperator) {
				lastItem = i
			}
		});
		if (!lastItem) {
			lastItem = (isOperator) ? this._lastOperator : this._lastNumber
		}
		return lastItem
	}

	setLastNumberToDisplay() {
		let lastNumber = this.getLastItem(false)
		if (!lastNumber) lastNumber = 0
		this.displayCalc = lastNumber
	}

	addOperation(val) {
		if (isNaN(this.getLastOperation())) {
			if (this.isOperator(val)) {
				this.setLastOperation(val)
			} else if (!isNaN(val)){
				this.pushOperation(val)
				this.setLastNumberToDisplay()
			}
		} else {
			if (this.isOperator(val)) {
				this.pushOperation(val)
			} else {
				let newOperation = this.getLastOperation().toString() + val.toString()
				this.setLastOperation(newOperation)
				this.setLastNumberToDisplay()
			}
		}
	}

	addDot() {
		let lastOperation = this.getLastOperation()

		if (typeof lastOperation === 'string' && lastOperation.split('').indexOf('.') > -1) return

		if (this.isOperator(lastOperation) || !lastOperation) {
			this.pushOperation('0.')
		} else {
			this.setLastOperation(lastOperation.toString() + '.')
		}
		this.setLastNumberToDisplay()
	}

	execBtn(val) {
		this.playAudio()
		switch (val) {
			case 'CE':
				this.clearAll()
				break
			case 'C':
				this.clearEntry()
				break
			case '+':
			case '-':
			case '/':
			case '*':
			case '%':
				this.addOperation(val)
				break
			case '=':
				this.calc()
				break
			case '.':
			case ',':
				this.addDot()
				break
			case '0':
			case '1':
			case '2':
			case '3':
			case '4':
			case '5':
			case '6':
			case '7':
			case '8':
			case '9':
				this.addOperation(parseInt(val))
				break

			default:
				this.setError()
				break
		}
	}

	copyToClipboard() {
		let input = document.createElement('input')
		input.value = this.displayCalc
		document.body.appendChild(input)
		input.select()
		document.execCommand('Copy')
		input.remove()
	}

	pasteFromClipboard() {
		document.addEventListener('paste', e => {
			let text = e.clipboardData.getData('Text')
			let textPaste = this.displayCalc = parseInt(text)
			if (typeof textPaste === 'number') {
				this.addOperation(textPaste)
			}
		})
	}

	initButtonsEvents() {
		let allButtons = document.querySelectorAll('.col-sm')
		allButtons.forEach(button => {
			let textBtn = button.textContent
			this.addEventListenerAll(button, 'click drag', () => {
				this.execBtn(textBtn)
			})

			if (textBtn == 'CE') {
				button.addEventListener('dblclick', () => {
					this._audioOnOff = !this._audioOnOff
				})
			}

			this.addEventListenerAll(button, "mouseover mouseup mousedown", () => {
				button.style.cursor = 'pointer'
			})
		})
	}


	initKeyboard() {
		document.addEventListener("keyup", e => {
			this.playAudio()
			switch (e.key) {
				case 'Escape':
					this.clearAll()
					break
				case 'Backspace':
					this.clearEntry()
					break
				case '+':
				case '-':
				case '/':
				case '*':
				case '%':
					this.addOperation(e.key)
					break
				case 'Enter':
				case '=':
					this.calc()
					break
				case '.':
				case ',':
					this.addDot()
					break
				case '0':
				case '1':
				case '2':
				case '3':
				case '4':
				case '5':
				case '6':
				case '7':
				case '8':
				case '9':
					this.addOperation(parseInt(e.key))
					break
				case 'c':
					if (e.ctrlKey) this.copyToClipboard()
					break
			}
		})
	}

	get displayCalc() {
		return this._displayCalcEL.innerHTML
	}
	set displayCalc(val) {
		if (val.toString().length > 10) {
			this.setError()
			this.clearAll()
			return false
		}
		this._displayCalcEL.innerHTML = val
	}

}