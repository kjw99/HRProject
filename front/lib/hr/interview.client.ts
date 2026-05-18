import {
  AssignInterviewerRequest,
  AssignInterviewerResponse,
} from "@/types/hr";
import {
  Applicant,
  ApplicantDetail,
  ApplicantMutationResponse,
  ApplicantUpdatePayload,
} from "@/types/applicant";
import { api } from "../api";

export const assignInterviewers = async (
  data: AssignInterviewerRequest,
): Promise<AssignInterviewerResponse> => {
  try {
    return await Promise.resolve({
      message: `${data.interviewers.length} interviewers assigned successfully.`,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to assign interviewers.";
    throw new Error(message);
  }
};

export const fetchApplicants = async (): Promise<Applicant[]> => {
  const response = await api.get<Applicant[]>("/api/candidates");
  return response.data;
};

export const fetchApplicantDetail = async (
  candidateId: number,
): Promise<ApplicantDetail> => {
  const response = await api.get<ApplicantDetail>(
    `/api/candidates/${candidateId}/detail`,
  );
  return response.data;
};

export const updateApplicant = async (
  candidateId: number,
  payload: ApplicantUpdatePayload,
): Promise<Applicant> => {
  const response = await api.patch<Applicant>(
    `/api/candidates/${candidateId}`,
    payload,
  );
  return response.data;
};

export const deleteApplicant = async (
  candidateId: number,
): Promise<ApplicantMutationResponse> => {
  await api.delete(`/api/candidates/${candidateId}`);
  return {
    message: "지원자가 삭제되었습니다.",
  };
};
