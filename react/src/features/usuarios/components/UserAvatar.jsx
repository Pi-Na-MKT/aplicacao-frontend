import React from 'react'
import AvatarNeutro from '../../../shared/components/AvatarNeutro'

export default function UserAvatar({ user, className = 'w-9 h-9' }) {
  const src = user?.avatarUrl || user?.avatar
  if (src) return <img src={src} className={`${className} rounded-full object-cover border-2 border-gray-100 flex-shrink-0`} alt=""/>
  return <AvatarNeutro className={className} />
}
