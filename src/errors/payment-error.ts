import { ApplicationError } from '@/protocols';

export function paymentRequiredError(): ApplicationError {
  return {
    name: 'paymentRequiredError',
    message: 'Check that your ticket has been paid!',
  };
}
