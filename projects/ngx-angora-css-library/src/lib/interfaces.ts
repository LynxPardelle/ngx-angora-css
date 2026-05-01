import {
	TAbreviationTraductor,
	TBPS,
	TClassCreationDiagnostic,
	TClassesValidationReport,
	TClassValidationOptions,
	TClassValidationResult,
	TConsoleParser,
	TCssCreateReport,
	TPseudo,
} from './types';

export interface IBPS extends TBPS {}

export interface IConsoleParser extends TConsoleParser {}

export interface IPseudo extends TPseudo {}

export interface IAbreviationTraductor extends TAbreviationTraductor {}

export interface IClassCreationDiagnostic extends TClassCreationDiagnostic {}

export interface IClassValidationOptions extends TClassValidationOptions {}

export interface IClassValidationResult extends TClassValidationResult {}

export interface IClassesValidationReport extends TClassesValidationReport {}

export interface ICssCreateReport extends TCssCreateReport {}
