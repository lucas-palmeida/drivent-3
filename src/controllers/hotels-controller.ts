import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import hotelsService from '@/services/hotels-service';

export async function getHotels(req:AuthenticatedRequest, res: Response) {
    const { userId } = req;

    try {
        const hotels = await hotelsService.getHotels(userId);
        return res.status(httpStatus.OK).send(hotels);
    } catch (error) {
        if(error.name === 'NotFoundError') {
            return res.sendStatus(httpStatus.NOT_FOUND);
        } else if(error.name === 'PaymentRequiredError') {
            return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
        } else {
            return res.sendStatus(httpStatus.BAD_REQUEST);
        }
    }
}

export async function getHotelById(req:AuthenticatedRequest, res: Response) {
    const { userId } = req;
    const { hotelId } = req.params;

    try {
        const hotel = await hotelsService.getHotelById(userId, Number(hotelId));
        return res.status(httpStatus.OK).send(hotel);
    } catch (error) {
        if(error.name === 'NotFoundError') {
            return res.sendStatus(httpStatus.NOT_FOUND);
        } else if(error.name === 'PaymentRequiredError') {
            return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
        } else {
            return res.sendStatus(httpStatus.BAD_REQUEST);
        }
    }
}