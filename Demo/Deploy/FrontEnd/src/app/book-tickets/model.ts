export class BookingInfo 
{
    movieId: number;
    movieName: string;
    cinemaName: string;
    cinemaAddr: string;
    cinemaId: number;
    showtimeId: number;
    startDate: Date;
    email: string;
    name: string;
    phone: string;
    orderId: number;
}
export class RoomVM 
{
    id: number;
    name: string;
    cols: number;
    rows: number;
    minPrice: number;
    checkoutKey: string;
    noOfMaxSeats: number;
    seats: SeatVM[];
    seatTypes: SeatTypeVM[]
}
export class SeatVM
{
    id: number;
    code: string;
    rowIndex: number;
    colIndex: number;
    status: number;
    coupleSeatId: number;
    seatTypeId:  number;
}
export class SeatTypeVM
{
    id: number;
    name: string;
    extraFee: number;
}
export class SelectedSeat
{
    id: number;
    code: string;
    seatTypeId: number;
    price: number;
}
