import { useMutation, useQueryClient } from 'react-query';
import api from '../../../libs/api';
import { AucctusQueryKeys } from './query-keys';
import { AxiosError } from 'axios';
import {
  IMessageResponse,
  IUpdateForgottenPasswordRequest,
  IServerErrorMessage,
  IRegisterUser,
} from '../../../libs/api/types';
import { useNavigate } from 'react-router-dom';
import { AppPath } from '../../../routes/routes';

export const useSignUp = () => {
  const navigate = useNavigate();

  return useMutation<IMessageResponse, AxiosError<IServerErrorMessage>, IRegisterUser, unknown>({
    mutationFn: async (details) =>
      await api.auth.signup(
        details.firstName,
        details.lastName,
        details.email,
        details.password,
        details.confirmPassword,
      ),
    onSuccess: () => {
      navigate(AppPath.ConfirmEmail);
    },
  });
};

export const useRequestPasswordReset = () => {
  return useMutation<IMessageResponse, AxiosError<IServerErrorMessage>, string, unknown>({
    mutationFn: async (email: string) => await api.auth.requestPasswordReset(email),
  });
};

export const usePasswordReset = () => {
  return useMutation<IMessageResponse, AxiosError<IServerErrorMessage>, IUpdateForgottenPasswordRequest, unknown>({
    mutationFn: async (credentials) =>
      await api.auth.resetPassword(credentials.password, credentials.confirmPassword, credentials.token),
  });
};

export const useConfirmEmail = () => {
  const queryClient = useQueryClient();
  return useMutation<IMessageResponse, AxiosError<IServerErrorMessage>, string, unknown>({
    mutationFn: async (token: string) => await api.auth.confirmEmail(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AucctusQueryKeys.userDetails });
    },
  });
};
