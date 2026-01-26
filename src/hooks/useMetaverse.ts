import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export interface MetaverseSpace {
  id: string;
  space_name: string;
  space_type: 'office' | 'showroom' | 'meeting' | 'event';
  owner_wallet: string | null;
  owner_user_id: string | null;
  max_capacity: number;
  current_visitors: number;
  position_data: { x: number; y: number; z: number };
  decoration_data: any;
  access_level: 'public' | 'members' | 'nft_holders' | 'private';
  required_nft_tier: string | null;
  is_live: boolean;
  created_at: string;
}

export interface MetaverseVisitor {
  id: string;
  space_id: string;
  visitor_wallet: string | null;
  visitor_user_id: string | null;
  display_name: string | null;
  avatar_url: string | null;
  position: { x: number; y: number; z: number };
  joined_at: string;
  last_active_at: string;
  is_speaking: boolean;
}

export function useMetaverse() {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();

  // Fetch all spaces
  const { data: spaces = [], isLoading: isLoadingSpaces } = useQuery({
    queryKey: ['metaverse-spaces'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('metaverse_spaces')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as MetaverseSpace[];
    }
  });

  // Fetch visitors in a specific space
  const useSpaceVisitors = (spaceId: string | null) => {
    const { data: visitors = [], isLoading } = useQuery({
      queryKey: ['space-visitors', spaceId],
      queryFn: async () => {
        if (!spaceId) return [];
        
        const { data, error } = await supabase
          .from('metaverse_visitors')
          .select('*')
          .eq('space_id', spaceId);

        if (error) throw error;
        return data as MetaverseVisitor[];
      },
      enabled: !!spaceId,
      refetchInterval: 5000 // Poll every 5 seconds for real-time feel
    });

    return { visitors, isLoading };
  };

  // Subscribe to real-time visitor updates
  const subscribeToSpace = (spaceId: string, onVisitorUpdate: (visitors: MetaverseVisitor[]) => void) => {
    const channel = supabase
      .channel(`space-${spaceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'metaverse_visitors',
          filter: `space_id=eq.${spaceId}`
        },
        async () => {
          // Refetch visitors on any change
          const { data } = await supabase
            .from('metaverse_visitors')
            .select('*')
            .eq('space_id', spaceId);
          
          if (data) {
            onVisitorUpdate(data as MetaverseVisitor[]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  // Enter a space
  const enterSpace = useMutation({
    mutationFn: async ({ spaceId, displayName, avatarUrl }: {
      spaceId: string;
      displayName?: string;
      avatarUrl?: string;
    }) => {
      // First check if already in a space and leave
      if (user) {
        await supabase
          .from('metaverse_visitors')
          .delete()
          .eq('visitor_user_id', user.id);
      }

      const { data, error } = await supabase
        .from('metaverse_visitors')
        .insert([{
          space_id: spaceId,
          visitor_user_id: user?.id,
          display_name: displayName || user?.email?.split('@')[0] || 'Anonymous',
          avatar_url: avatarUrl,
          position: { x: 0, y: 0, z: 0 }
        }])
        .select()
        .single();

      if (error) throw error;

      // Update space visitor count
      await supabase
        .from('metaverse_spaces')
        .update({ current_visitors: spaces.find(s => s.id === spaceId)?.current_visitors || 0 + 1 })
        .eq('id', spaceId);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metaverse-spaces'] });
    }
  });

  // Leave space
  const leaveSpace = useMutation({
    mutationFn: async (spaceId: string) => {
      if (!user) return;

      const { error } = await supabase
        .from('metaverse_visitors')
        .delete()
        .eq('visitor_user_id', user.id)
        .eq('space_id', spaceId);

      if (error) throw error;

      // Update space visitor count
      const space = spaces.find(s => s.id === spaceId);
      if (space && space.current_visitors > 0) {
        await supabase
          .from('metaverse_spaces')
          .update({ current_visitors: space.current_visitors - 1 })
          .eq('id', spaceId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metaverse-spaces'] });
    }
  });

  // Update position
  const updatePosition = useMutation({
    mutationFn: async ({ visitorId, position }: {
      visitorId: string;
      position: { x: number; y: number; z: number };
    }) => {
      const { error } = await supabase
        .from('metaverse_visitors')
        .update({ 
          position,
          last_active_at: new Date().toISOString()
        })
        .eq('id', visitorId);

      if (error) throw error;
    }
  });

  // Toggle speaking status
  const toggleSpeaking = useMutation({
    mutationFn: async ({ visitorId, isSpeaking }: {
      visitorId: string;
      isSpeaking: boolean;
    }) => {
      const { error } = await supabase
        .from('metaverse_visitors')
        .update({ is_speaking: isSpeaking })
        .eq('id', visitorId);

      if (error) throw error;
    }
  });

  return {
    spaces,
    isLoading: isLoadingSpaces,
    useSpaceVisitors,
    subscribeToSpace,
    enterSpace,
    leaveSpace,
    updatePosition,
    toggleSpeaking
  };
}
