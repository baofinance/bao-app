import { IconDefinition, IconPrefix, IconName } from '@fortawesome/fontawesome-svg-core'

declare module '@fortawesome/fontawesome-svg-core' {
	export type IconProp = IconName | [IconPrefix, IconName] | IconDefinition
}
