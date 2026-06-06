import { mutationOptions } from "@tanstack/react-query";
import {
  archiveForm,
  archiveLocation,
  cloneForm,
  cloneTeam,
  createForm,
  createLocation,
  createMember,
  createTeam,
  deleteTeam,
  duplicateForm,
  publishForm,
  setLocationPhoto,
  startResetMemberPin,
  submitPublicForm,
  trackPublicScan,
  transferMember,
  updateForm,
  updateLocation,
  updateMember,
  updateTeam,
  verifyResetMemberPin,
} from "../endpoints";
import type {
  CreateLocationInput,
  LocationPhotoInput,
  UpdateLocationInput,
} from "@/types/api/locations";
import type {
  CloneFormInput,
  CloneTeamInput,
  CreateFormInput,
  CreateMemberInput,
  CreateTeamInput,
  FormEntity,
  Team,
  TransferMemberInput,
  UpdateFormInput,
  UpdateMemberInput,
  UpdateTeamInput,
} from "@/types/api/teams";
import type {
  PublicSubmitInput,
  TrackScanInput,
} from "@/types/api/public-forms";

export const moMutations = {
  // Locations
  createLocation: () =>
    mutationOptions({
      mutationFn: (input: CreateLocationInput) => createLocation(input),
    }),
  updateLocation: () =>
    mutationOptions({
      mutationFn: (vars: { id: string; input: UpdateLocationInput }) =>
        updateLocation(vars.id, vars.input),
    }),
  archiveLocation: () =>
    mutationOptions({
      mutationFn: (id: string) => archiveLocation(id),
    }),
  setLocationPhoto: () =>
    mutationOptions({
      mutationFn: (vars: { id: string; input: LocationPhotoInput }) =>
        setLocationPhoto(vars.id, vars.input),
    }),

  // Teams
  createTeam: () =>
    mutationOptions({
      mutationFn: (vars: { locationId: string; input: CreateTeamInput }) =>
        createTeam(vars.locationId, vars.input),
    }),
  updateTeam: () =>
    mutationOptions({
      mutationFn: (vars: { teamId: string; input: UpdateTeamInput }) =>
        updateTeam(vars.teamId, vars.input),
    }),
  deleteTeam: () =>
    mutationOptions({
      mutationFn: (teamId: string) => deleteTeam(teamId),
    }),
  cloneTeam: () =>
    mutationOptions({
      mutationFn: (vars: { teamId: string; input: CloneTeamInput }) =>
        cloneTeam(vars.teamId, vars.input),
    }),

  // Members
  createMember: () =>
    mutationOptions({
      mutationFn: (vars: { locationId: string; input: CreateMemberInput }) =>
        createMember(vars.locationId, vars.input),
    }),
  updateMember: () =>
    mutationOptions({
      mutationFn: (vars: { memberId: string; input: UpdateMemberInput }) =>
        updateMember(vars.memberId, vars.input),
    }),
  transferMember: () =>
    mutationOptions({
      mutationFn: (vars: { memberId: string; input: TransferMemberInput }) =>
        transferMember(vars.memberId, vars.input),
    }),
  startResetMemberPin: () =>
    mutationOptions({
      mutationFn: (memberId: string) => startResetMemberPin(memberId),
    }),
  verifyResetMemberPin: () =>
    mutationOptions({
      mutationFn: (vars: {
        memberId: string;
        input: { otp: string; pin: string };
      }) => verifyResetMemberPin(vars.memberId, vars.input),
    }),

  // Forms
  createForm: () =>
    mutationOptions({
      mutationFn: (vars: { teamId: string; input: CreateFormInput }) =>
        createForm(vars.teamId, vars.input),
    }),
  updateForm: () =>
    mutationOptions({
      mutationFn: (vars: { formId: string; input: UpdateFormInput }) =>
        updateForm(vars.formId, vars.input),
    }),
  publishForm: () =>
    mutationOptions({
      mutationFn: (formId: string) => publishForm(formId),
    }),
  archiveForm: () =>
    mutationOptions({
      mutationFn: (formId: string) => archiveForm(formId),
    }),
  duplicateForm: () =>
    mutationOptions({
      mutationFn: (formId: string) => duplicateForm(formId),
    }),
  cloneForm: () =>
    mutationOptions({
      mutationFn: (vars: { formId: string; input: CloneFormInput }) =>
        cloneForm(vars.formId, vars.input),
    }),

  // Public form surface
  trackPublicScan: () =>
    mutationOptions({
      mutationFn: (vars: { publicId: string; input?: TrackScanInput }) =>
        trackPublicScan(vars.publicId, vars.input ?? {}),
    }),
  submitPublicForm: () =>
    mutationOptions({
      mutationFn: (vars: { publicId: string; input: PublicSubmitInput }) =>
        submitPublicForm(vars.publicId, vars.input),
    }),
};

export type CreateLocationResult = Awaited<
  ReturnType<typeof moMutations.createLocation>
>;
export type CreatedForm = FormEntity;
export type CreatedTeam = Team;
