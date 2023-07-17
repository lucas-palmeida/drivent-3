import { ApplicationError } from '@/protocols';

export function paymentRequiredError(): ApplicationError {
  return {
    name: 'PaymentRequiredError',
    message: 'Check that your ticket has been paid!',
  };
}
