import { EmailAvailabilityResponse } from "@/types/admin";
import { api } from "../api";

export const checkEmailAvailability = async (
    email: string,
): Promise<EmailAvailabilityResponse> => {
    const response = await api.get<EmailAvailabilityResponse>(
        "/api/users/email-availability",
        {
            params: { email },
        },
    );
    return response.data;
};