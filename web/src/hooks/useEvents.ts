import { useQuery } from '@tanstack/react-query'

import { getEventNames } from '../utils/factory';

export default function useEvents() {
    return useQuery(['events'], getEventNames);
}
