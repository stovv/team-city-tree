/*
           !Team City interfaces
*/
export interface BuildTypes {
    count: number;
    buildType: BuildTypeItem[];
}
export interface BuildTypeItem {
    id: string;
    name: string;
    projectName: string;
    projectId: string;
    href: string;
    webUrl: string;
}

export interface BuildItems {
    count: number;
    href: string;
    nextHref: string;
    build: BuildItem[];
}
export interface BuildItem {
    id: number;
    buildTypeId: string;
    number: string;
    status: string;
    state: string;
    branchName: string;
    defaultBranch: boolean;
    href: string;
    webUrl: string;
}

export interface Templates {
    count: number;
    buildType: any[];
}

export interface Parameters {
    count: number;
    href: string;
    property: any[];
}

export interface VcsRoots {
    count: number;
    href: string;
}

export interface Property {
    name: string;
    value: string;
}

export interface Properties {
    count: number;
    href: string;
    property: Property[];
}

export interface ProjectFeature {
    id: string;
    type: string;
    href: string;
    properties: Properties;
}

export interface ProjectFeatures {
    count: number;
    href: string;
    projectFeature: ProjectFeature[];
}

export interface Project {
    id: string;
    name: string;
    parentProjectId: string;
    description: string;
    href: string;
    webUrl: string;
}

export interface Projects {
    count: number;
    project: Project[];
}

export interface RootObject {
    id: string;
    name: string;
    description: string;
    href: string;
    webUrl: string;
    buildTypes: BuildTypes;
    templates: Templates;
    parameters: Parameters;
    vcsRoots: VcsRoots;
    projectFeatures: ProjectFeatures;
    projects: Projects;
    parentProjectId: string;
    parentProject: Project;
}
