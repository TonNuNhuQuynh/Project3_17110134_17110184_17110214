export class OrderDetails
{
    seatTypeName: string;
    quantity: number;
    amount: number;
}
export class Order
{
    id: number;
    total: number;
    showtime: Date;
    name: string;
    email: string;
    phone: string;
    roomName: string;
    createdDate: Date;
    accountId: number;
    movieId: number;
    cinemaId: number;
    showtimeId: number;
    seatsInOrderVMs: SeatsInOrder[]
}
export class SeatsInOrder
{
    orderId: number;
    seatId: number;
    code: string;
    price: number;
}
export class PaymentRequest
{
    order: Order;
    token: any;
}