import { Theme } from './theme';
import { CSSObject, CSSProp } from 'styled-components';

declare module "styled-components" {
    export interface DefaultTheme extends Theme {}
}

declare module "react" {
    interface Attributes {
        css?: CSSProp | CSSObject;
    }
}