import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { RoomVM, SeatVM, SelectedSeat } from '../model';
import { RowInRoom } from './model';

@Component({
  selector: 'app-seats',
  templateUrl: './seats.component.html',
  styleUrls: ['./seats.component.css']
})
export class SeatsComponent implements OnInit {

  alphabet: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  rowTitles: string[] = [];
  roomInfo: RoomVM;
  irRevelants: number[] = [7, 8, 9, 10]
  rowsInRoom: RowInRoom[] = [];
  seatTypeColors: string[] = ['#dfdfdf', '#d4b15f',  '#3b5998', '#ee7674', '#ff5b5b', '#e63757'];
  selectedSeats: SelectedSeat[] = [];
  total: number = 0;
  coupleSeatType: number = 3;

  @Output() seatChanged: EventEmitter<SelectedSeat[]> = new EventEmitter();
  @Output() totalChanged: EventEmitter<number> = new EventEmitter();

  constructor() { }

  ngOnInit(): void 
  {
    if (this.roomInfo != null) 
    {
      for (let index = 0; index < this.roomInfo.rows; index++) this.rowTitles.push(this.alphabet.charAt(index));
    }
    this.getSeats();

  }
  getSeats()
  {
    for (let index = 0; index < this.roomInfo.rows; index++) 
    {
      let seats = this.roomInfo.seats.filter(s => s.rowIndex == index).sort((a, b) => a.colIndex - b.colIndex);
      let row: RowInRoom = {index: index, seats: seats};
      this.rowsInRoom.push(row)
    }
  }
  updateSeatsAndTotal(seat: SeatVM, extra: number)
  {
    if (this.selectedSeats.find(s => s.id == seat.id)) 
    {
      this.selectedSeats = this.selectedSeats.filter(s => s.id != seat.id)
      this.total -= (this.roomInfo.minPrice + extra);
    }
    else 
    {
      this.selectedSeats.push({id: seat.id, code: seat.code, seatTypeId: seat.seatTypeId, price: this.roomInfo.minPrice + extra});
      this.total += (this.roomInfo.minPrice + extra);
    }
  }
  pickSeat(seat: SeatVM)
  {
    if (seat.status != 0) return;
    
    let extraFee = this.roomInfo.seatTypes.find(s => s.id == seat.seatTypeId).extraFee;
    this.updateSeatsAndTotal(seat, extraFee);

    // if (this.selectedSeats.find(s => s.id == seat.id)) this.selectedSeats = this.selectedSeats.filter(s => s.id != seat.id)
    // else this.selectedSeats.push({id: seat.id, code: seat.code});
    
    if (seat.seatTypeId == this.coupleSeatType) //Nếu ghế chọn là 1 trong cặp ghế đôi
    {
      let coupleSeat = null;
      if (seat.coupleSeatId == null) coupleSeat = this.rowsInRoom[seat.rowIndex].seats.find(s => s.id == seat.id + 1);
      else coupleSeat = this.rowsInRoom[seat.rowIndex].seats.find(s => s.id == seat.id - 1);
      this.updateSeatsAndTotal(coupleSeat, extraFee);
    }
    this.seatChanged.emit(this.selectedSeats);
    this.totalChanged.emit(this.total);
  }
  selected(seat: SeatVM)
  {
    if (this.selectedSeats.find(s => s.id == seat.id)) return true;
    return false;
  }
}
