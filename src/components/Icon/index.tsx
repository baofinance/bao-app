import React from 'react'
import { IconDefinition, IconProp } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon, FontAwesomeIconProps } from '@fortawesome/react-fontawesome'

interface IconProps extends Omit<FontAwesomeIconProps, 'icon'> {
	icon: IconDefinition
}

export const Icon: React.FC<IconProps> = ({ icon, ...props }) => <FontAwesomeIcon icon={icon as unknown as IconProp} {...props} />

export default Icon
