

var end_game = new Event('end_game');
var start_game = new Event('start_game');
var win_game = new Event('win_game');

function call_start() {
	document.dispatchEvent(start_game);
}

document.addEventListener('end_game', () => {
	for (let i = 0; i < main_field.height; i++) {
			for (let j = 0; j < main_field.width; j++) {
				if (main_field.field[i][j].type == 'bomb') {
					main_field.field[i][j].elem.classList.add('bomb');
					main_field.field[i][j].elem.classList.remove('flag');	
				}
				main_field.field[i][j].elem.removeEventListener('Enter', main_field.handleEvent);
				main_field.field[i][j].elem.removeEventListener('click', main_field.handleEvent);
				main_field.field[i][j].elem.removeEventListener('contextmenu', main_field.handleEvent);

			}
	}
	document.removeEventListener('keydown', main_field.handleEvent);

})

document.addEventListener('start_game', (e) => {
	main_field = new Field();
	main_field.generate_html();
	main_field.generate_field();
})


document.addEventListener('win_game', () => {
	alert('You win');
	for (let i = 0; i < main_field.height; i++) {
		for (let j = 0; j < main_field.width; j++) {
			main_field.field[i][j].elem.removeEventListener('Enter', main_field.handleEvent);
			main_field.field[i][j].elem.removeEventListener('click', main_field.handleEvent);
			main_field.field[i][j].elem.removeEventListener('contextmenu', main_field.handleEvent);
		}
	}
	document.removeEventListener('keydown', main_field.handleEvent);
})



function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Button {


		constructor(html_elem) {
			this.type = 'simple';
			this.elem = html_elem;
			this.is_view = false;
			this.is_mine = false;
			this.is_danger = false;
	}


	view() {
		this.is_view = true;
		this.elem.classList.toggle('no_view');
		this.elem.removeEventListener('click', this);
		this.elem.removeEventListener('Enter', this);
		this.elem.removeEventListener('contextmenu ', this);

		if (this.is_mine) {
			document.dispatchEvent(end_game);
			this.elem.classList.add('bomb');
			alert('game over');	
		}

		if (this.type == 'number')
			this.elem.innerHTML = this.count_mines;
	}
	

	change_flag() {
		this.is_danger = !this.is_danger;
		if (this.is_danger) {
			this.elem.removeEventListener('click', main_field.handleEvent);
			this.elem.removeEventListener('Enter', main_field.handleEvent);
		}
		else {
			this.elem.addEventListener('Enter', main_field.handleEvent);
			this.elem.addEventListener('click', main_field.handleEvent);

		}

		this.elem.classList.toggle('flag');
	}
}


class MineButton extends Button {

	constructor(html_elem) {
		super();
		this.type = 'bomb';
		this.elem = html_elem;
		this.is_view = false;
		this.is_mine = true;

	}

}


class NumberButton extends Button {

	constructor(html_elem) {
		super();
		this.type = 'number';
		this.elem = html_elem;
		this.is_view = false;
		this.count_mines = 0;
	}

	calculate(position_x, position_y, miner_field) {
		if (miner_field[position_x+1]) {
			if (miner_field[position_x+1][position_y])
				if (miner_field[position_x+1][position_y].is_mine)
					this.count_mines += 1;
			if (miner_field[position_x+1][position_y+1])
				if (miner_field[position_x+1][position_y+1].is_mine)
					this.count_mines += 1;
			if (miner_field[position_x+1][position_y-1])
				if (miner_field[position_x+1][position_y-1].is_mine)
					this.count_mines += 1;
		}
		if (miner_field[position_x-1]) {
			if (miner_field[position_x-1][position_y+1])
				if (miner_field[position_x-1][position_y+1].is_mine)
					this.count_mines += 1;
			if (miner_field[position_x-1][position_y])
				if (miner_field[position_x-1][position_y].is_mine)
					this.count_mines += 1;
			if (miner_field[position_x-1][position_y-1])
				if (miner_field[position_x-1][position_y-1].is_mine)
					this.count_mines += 1;
		}
		
		if (miner_field[position_x]){
			if (miner_field[position_x][position_y+1])
				if (miner_field[position_x][position_y+1].is_mine)
					this.count_mines += 1;
			if (miner_field[position_x][position_y-1])
				if (miner_field[position_x][position_y-1].is_mine)
					this.count_mines += 1;
		}
	}
}	


class Field {

	constructor() {
		this.width = 12;
		this.height = 12;
		this.count_mines = 15;
		this.is_first_click = true;
		this.field = new Array(this.height);
		this.current_element = undefined;
		document.addEventListener('keydown', this.handleEvent);
		for (let i = 0; i < this.height; i++)
			this.field[i] = new Array(this.width);
	}

	generate_html() {
		let main_elem = document.getElementsByClassName('mines_field')[0];
		main_elem.innerHTML = "";
		for (let i = 0; i < this.height; i++) {
			main_elem.innerHTML += "<div class='field_row'>";
			for (let j = 0; j < this.width; j++) {
				main_elem.innerHTML += "<div class='mine no_view' id='mine-" + i + "-" + j + "' data_x='" + i  + "' data_y='" + j + "'></div>";
			}
			main_elem.innerHTML += "</div>";
		}
	}

	generate_field() {
		for (let i = 0; i < this.height; i++) 
			for (let j = 0; j < this.width; j++) {
				this.field[i][j] = new Button(document.getElementById('mine-'+i+'-'+j));
				this.field[i][j].elem.addEventListener('Enter', this.handleEvent);
				this.field[i][j].elem.addEventListener('click', this.handleEvent);
				this.field[i][j].elem.addEventListener('contextmenu', this.handleEvent);
			}
		this.current_element = this.field[0][0];
		this.current_element.elem.classList.add('is_current');

	}


	generate_mines(step_x, step_y) {
		let m_x, m_y;
		for (let i = 0; i < this.count_mines;) {
			m_x = random(0, this.width-1);
			m_y = random(0, this.height-1);
			if ((m_x == step_x) && (m_y == step_y))
				continue;
			if (this.field[m_x][m_y].is_mine == false) {
				this.field[m_x][m_y] = new MineButton(this.field[m_x][m_y].elem);
				i++;

			}
		}
	}

	check_mine_near_button(i, j, button) {
		let num = new NumberButton(button.elem);
		num.calculate(i, j, this.field);

		if (num.count_mines != 0)
			return num;
		else
			return button;
	}

	generate_numbers() {
		let mines;
		for (let i = 0; i < this.height; i++) {
			for (let j = 0; j < this.width; j++) {
				if (this.field[i][j].is_mine == false)
					this.field[i][j] = this.check_mine_near_button(i, j, this.field[i][j]);
			}
		}
	}

	check_game() {
		let is_end = true;
		for (let i = 0; i < this.height; i++) {
			for (let j = 0; j < this.width; j++) {
				if (this.field[i][j].is_view == false)
					if (this.field[i][j].is_mine == false)
						is_end = false;

			}
		}
		if (is_end) {
			document.dispatchEvent(win_game);
		}
	}

	handleEvent(event) {
		if ((event.type == 'click') || (event.type == 'contextmenu')) {
			let x = Number(event.srcElement.attributes.data_x.value);
			let y = Number(event.srcElement.attributes.data_y.value);
			let elem = main_field.field[x][y];
			
			if (event.type == 'contextmenu') {
				event.preventDefault();
				elem.change_flag();
				return;
			}

			if (main_field.is_first_click) {
				main_field.generate_mines(x, y)
				main_field.generate_numbers();
				main_field.is_first_click = false;
				main_field.open_mine(x, y, true);
				return
			}
			if (event.type == 'click') {
        		main_field.open_mine(x, y, true);
		}
		}

		else if (event.code == 'Enter' && (event.ctrlKey || event.metaKey || event.shiftKey)) {

			main_field.current_element.change_flag();	
		}
		else if (event.code == 'Enter') {
			let x = main_field.current_element.elem.attributes.data_x.value;
			let y = main_field.current_element.elem.attributes.data_y.value;
			if (main_field.is_first_click) {
				main_field.generate_mines(x, y)
				main_field.generate_numbers();
				main_field.is_first_click = false;
				main_field.open_mine(x, y, true);
			}
			else
				main_field.open_mine(x, y, true);
		}
		else if (event.type == 'keydown') {
			let x = Number(main_field.current_element.elem.attributes.data_x.value);
			let y = Number(main_field.current_element.elem.attributes.data_y.value);
			if (event.key == 'ArrowUp'){
				x -= 1;
				if (x < 0)
					x = main_field.height - 1;
			}
			else if (event.key == 'ArrowDown'){
				x += 1;
				if (x >= main_field.height)
					x = 0;
			}
			else if (event.key == 'ArrowLeft'){
				y -= 1;
				if (y < 0)
					y = main_field.width - 1;
			}
			else if (event.key == 'ArrowRight'){
				y += 1;
				if (y >= main_field.width)
					y = 0;
			}
			
			main_field.current_element.elem.classList.remove('is_current');
			main_field.current_element = main_field.field[x][y];
			main_field.current_element.elem.classList.add('is_current');

		}
		main_field.check_game();
    }

	open_mine(i, j, is_user) {
		i = new Number(i);
		j = new Number(j);
		if (this.field[i]) {
			if (this.field[i][j]) {
				if (this.field[i][j].is_view)
					return;
			}
			else
				return;
			}
		else
			return;
		if ((this.field[i][j].type == 'bomb') && (is_user)) 
			this.field[i][j].view();

		else if (this.field[i][j].type == 'number') {
			this.field[i][j].view();
		}
		else if (this.field[i][j].type == 'simple') {
			this.field[i][j].view();	
			this.open_mine(i, j+1, false);
			this.open_mine(i+1, j+1, false);
			this.open_mine(i+1, j, false);
			this.open_mine(i+1, j-1, false);
			this.open_mine(i, j-1, false);
			this.open_mine(i-1, j-1, false);
			this.open_mine(i-1, j, false);
			this.open_mine(i-1, j+1, false);
		}	
	}
}

let main_field = new Field();
main_field.generate_html();
main_field.generate_field();
