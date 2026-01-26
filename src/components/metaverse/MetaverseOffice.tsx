import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Text, 
  Box, 
  Plane, 
  Cylinder, 
  Html,
  Environment,
  Float,
  Sparkles,
  MeshReflectorMaterial
} from '@react-three/drei';
import * as THREE from 'three';
import { useMetaverse, MetaverseVisitor } from '@/hooks/useMetaverse';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Mic, MicOff, MapPin, LogOut, Maximize2 } from 'lucide-react';

// Avatar component for each visitor
function Avatar({ visitor, isCurrentUser }: { visitor: MetaverseVisitor; isCurrentUser: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const position = visitor.position || { x: 0, y: 0, z: 0 };
  
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = position.y + 0.8 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  return (
    <group position={[position.x, 0, position.z]}>
      {/* Body */}
      <Cylinder args={[0.3, 0.4, 0.8, 16]} position={[0, 0.4, 0]}>
        <meshStandardMaterial 
          color={isCurrentUser ? "#8b5cf6" : "#3b82f6"} 
          metalness={0.3}
          roughness={0.4}
        />
      </Cylinder>
      
      {/* Head */}
      <mesh ref={meshRef} position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial 
          color={isCurrentUser ? "#a78bfa" : "#60a5fa"}
          metalness={0.2}
          roughness={0.3}
        />
      </mesh>
      
      {/* Speaking indicator */}
      {visitor.is_speaking && (
        <Float speed={5} rotationIntensity={0} floatIntensity={0.5}>
          <mesh position={[0, 1.3, 0]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={1} />
          </mesh>
        </Float>
      )}
      
      {/* Name tag */}
      <Html position={[0, 1.5, 0]} center distanceFactor={8}>
        <div className="bg-black/80 px-2 py-1 rounded text-xs text-white whitespace-nowrap">
          {visitor.display_name || 'Anonymous'}
          {isCurrentUser && <span className="ml-1 text-purple-400">(You)</span>}
        </div>
      </Html>
    </group>
  );
}

// Desk component
function Desk({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Desk top */}
      <Box args={[2, 0.1, 1]} position={[0, 0.75, 0]}>
        <meshStandardMaterial color="#374151" metalness={0.1} roughness={0.8} />
      </Box>
      {/* Legs */}
      {[[-0.9, -0.4], [0.9, -0.4], [-0.9, 0.4], [0.9, 0.4]].map(([x, z], i) => (
        <Cylinder key={i} args={[0.05, 0.05, 0.7, 8]} position={[x, 0.35, z]}>
          <meshStandardMaterial color="#1f2937" metalness={0.3} roughness={0.5} />
        </Cylinder>
      ))}
      {/* Monitor */}
      <Box args={[0.8, 0.5, 0.05]} position={[0, 1.1, -0.3]}>
        <meshStandardMaterial color="#111827" metalness={0.2} roughness={0.3} />
      </Box>
      {/* Screen glow */}
      <Box args={[0.75, 0.45, 0.01]} position={[0, 1.1, -0.27]}>
        <meshStandardMaterial 
          color="#8b5cf6" 
          emissive="#8b5cf6" 
          emissiveIntensity={0.5}
        />
      </Box>
    </group>
  );
}

// Meeting table
function MeetingTable({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Table top - circular */}
      <Cylinder args={[2, 2, 0.1, 32]} position={[0, 0.75, 0]}>
        <meshStandardMaterial color="#1e1b4b" metalness={0.2} roughness={0.5} />
      </Cylinder>
      {/* Center hologram projector */}
      <Cylinder args={[0.3, 0.2, 0.05, 16]} position={[0, 0.82, 0]}>
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={1} />
      </Cylinder>
      {/* Hologram effect */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.3}>
        <mesh position={[0, 1.5, 0]}>
          <icosahedronGeometry args={[0.3, 1]} />
          <meshStandardMaterial 
            color="#8b5cf6" 
            emissive="#8b5cf6" 
            emissiveIntensity={1}
            transparent
            opacity={0.6}
            wireframe
          />
        </mesh>
      </Float>
      <Sparkles count={20} scale={2} position={[0, 1.5, 0]} color="#8b5cf6" />
    </group>
  );
}

// Product display pedestal
function ProductDisplay({ position, product }: { position: [number, number, number]; product: { name: string; price: string } }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <group position={position}>
      {/* Pedestal */}
      <Cylinder args={[0.5, 0.6, 0.8, 16]} position={[0, 0.4, 0]}>
        <meshStandardMaterial color="#1f2937" metalness={0.3} roughness={0.5} />
      </Cylinder>
      {/* Glass display case */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 0.8, 16]} />
        <meshStandardMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.1}
          metalness={0.9}
          roughness={0}
        />
      </mesh>
      {/* Product (represented as glowing box) */}
      <Float speed={3} rotationIntensity={0.2} floatIntensity={0.2}>
        <mesh ref={meshRef} position={[0, 1.2, 0]}>
          <boxGeometry args={[0.25, 0.25, 0.25]} />
          <meshStandardMaterial 
            color="#f59e0b" 
            emissive="#f59e0b" 
            emissiveIntensity={0.5}
            metalness={0.5}
            roughness={0.2}
          />
        </mesh>
      </Float>
      {/* Price tag */}
      <Html position={[0, 0.3, 0.7]} center distanceFactor={8}>
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1 rounded-full text-xs text-white whitespace-nowrap">
          <div className="font-bold">{product.name}</div>
          <div className="text-purple-200">{product.price}</div>
        </div>
      </Html>
    </group>
  );
}

// Wall with portal effect
function PortalWall({ position, rotation, label }: { position: [number, number, number]; rotation: [number, number, number]; label: string }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Portal frame */}
      <mesh>
        <torusGeometry args={[1.2, 0.1, 8, 32]} />
        <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.5} />
      </mesh>
      {/* Portal surface */}
      <mesh position={[0, 0, 0.01]}>
        <circleGeometry args={[1.1, 32]} />
        <meshStandardMaterial 
          color="#1e1b4b" 
          emissive="#3b82f6" 
          emissiveIntensity={0.3}
        />
      </mesh>
      <Sparkles count={30} scale={2.5} color="#a78bfa" />
      <Html position={[0, -1.6, 0]} center>
        <div className="bg-purple-600/80 px-3 py-1 rounded text-sm text-white whitespace-nowrap">
          {label}
        </div>
      </Html>
    </group>
  );
}

// Main Office Floor
function OfficeFloor() {
  return (
    <group>
      {/* Main floor with reflection */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={0.8}
          mixStrength={15}
          roughness={0.7}
          depthScale={1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#0a0a1a"
          metalness={0.5}
          mirror={0.5}
        />
      </mesh>
      
      {/* Grid lines on floor */}
      <gridHelper args={[40, 40, '#1e1b4b', '#1e1b4b']} position={[0, 0.01, 0]} />
    </group>
  );
}

// Main scene content
function Scene({ visitors, currentUserId }: { visitors: MetaverseVisitor[]; currentUserId: string | null }) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#8b5cf6" />
      <pointLight position={[-10, 10, -10]} intensity={0.8} color="#3b82f6" />
      <spotLight position={[0, 15, 0]} intensity={0.5} angle={0.3} penumbra={1} color="#ffffff" castShadow />
      
      {/* Floor */}
      <OfficeFloor />
      
      {/* CEO Desk Area */}
      <group position={[0, 0, -8]}>
        <Desk position={[0, 0, 0]} />
        <Text
          position={[0, 2.5, -1]}
          fontSize={0.5}
          color="#8b5cf6"
          anchorX="center"
          anchorY="middle"
        >
          CEO COMMAND CENTER
        </Text>
      </group>
      
      {/* Work Desks */}
      <Desk position={[-5, 0, -3]} rotation={Math.PI / 4} />
      <Desk position={[5, 0, -3]} rotation={-Math.PI / 4} />
      <Desk position={[-5, 0, 3]} rotation={Math.PI * 0.75} />
      <Desk position={[5, 0, 3]} rotation={-Math.PI * 0.75} />
      
      {/* Meeting Room */}
      <group position={[10, 0, 0]}>
        <MeetingTable position={[0, 0, 0]} />
        <Text
          position={[0, 3, 0]}
          fontSize={0.4}
          color="#3b82f6"
          anchorX="center"
          anchorY="middle"
        >
          STRATEGY ROOM
        </Text>
      </group>
      
      {/* Product Showroom */}
      <group position={[-10, 0, 0]}>
        <ProductDisplay position={[-2, 0, 0]} product={{ name: "Premium NFT", price: "0.5 ETH" }} />
        <ProductDisplay position={[0, 0, 0]} product={{ name: "Gold Pass", price: "1.0 ETH" }} />
        <ProductDisplay position={[2, 0, 0]} product={{ name: "Diamond Pass", price: "2.5 ETH" }} />
        <Text
          position={[0, 3, 0]}
          fontSize={0.4}
          color="#f59e0b"
          anchorX="center"
          anchorY="middle"
        >
          PRODUCT SHOWROOM
        </Text>
      </group>
      
      {/* Portal Walls */}
      <PortalWall position={[0, 1.5, -15]} rotation={[0, 0, 0]} label="→ DAO Voting Hall" />
      <PortalWall position={[-15, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} label="→ NFT Gallery" />
      <PortalWall position={[15, 1.5, 0]} rotation={[0, -Math.PI / 2, 0]} label="→ Trading Floor" />
      
      {/* Visitors/Avatars */}
      {visitors.map(visitor => (
        <Avatar 
          key={visitor.id} 
          visitor={visitor} 
          isCurrentUser={visitor.visitor_user_id === currentUserId}
        />
      ))}
      
      {/* Ambient particles */}
      <Sparkles count={100} scale={30} size={1} speed={0.3} color="#8b5cf6" />
      
      {/* Environment */}
      <Environment preset="night" />
    </>
  );
}

// Player controller
function PlayerController({ onMove }: { onMove: (pos: { x: number; y: number; z: number }) => void }) {
  const { camera } = useThree();
  const keys = useRef({ w: false, a: false, s: false, d: false });
  const velocity = useRef(new THREE.Vector3());
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() in keys.current) {
        keys.current[e.key.toLowerCase() as keyof typeof keys.current] = true;
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() in keys.current) {
        keys.current[e.key.toLowerCase() as keyof typeof keys.current] = false;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  useFrame((_, delta) => {
    const speed = 5;
    const direction = new THREE.Vector3();
    
    if (keys.current.w) direction.z -= 1;
    if (keys.current.s) direction.z += 1;
    if (keys.current.a) direction.x -= 1;
    if (keys.current.d) direction.x += 1;
    
    if (direction.length() > 0) {
      direction.normalize();
      direction.applyQuaternion(camera.quaternion);
      direction.y = 0;
      direction.normalize();
      
      velocity.current.add(direction.multiplyScalar(speed * delta));
      velocity.current.multiplyScalar(0.9); // Friction
      
      camera.position.add(velocity.current);
      
      // Broadcast position
      onMove({
        x: camera.position.x,
        y: 0,
        z: camera.position.z
      });
    }
  });
  
  return null;
}

// Main component
export function MetaverseOffice() {
  const { spaces, enterSpace, leaveSpace, updatePosition, toggleSpeaking, useSpaceVisitors, subscribeToSpace } = useMetaverse();
  const { user } = useAuthContext();
  const [currentSpace, setCurrentSpace] = useState<string | null>(null);
  const [currentVisitorId, setCurrentVisitorId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [visitors, setVisitors] = useState<MetaverseVisitor[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const officeSpace = spaces.find(s => s.space_type === 'office');
  const { visitors: spaceVisitors } = useSpaceVisitors(currentSpace);
  
  // Update visitors when they change
  useEffect(() => {
    if (spaceVisitors.length > 0) {
      setVisitors(spaceVisitors);
    }
  }, [spaceVisitors]);
  
  // Subscribe to real-time updates
  useEffect(() => {
    if (!currentSpace) return;
    
    const unsubscribe = subscribeToSpace(currentSpace, (updatedVisitors) => {
      setVisitors(updatedVisitors);
    });
    
    return () => {
      unsubscribe();
    };
  }, [currentSpace, subscribeToSpace]);
  
  const handleEnterOffice = async () => {
    if (!officeSpace) return;
    
    try {
      const result = await enterSpace.mutateAsync({
        spaceId: officeSpace.id,
        displayName: user?.email?.split('@')[0]
      });
      setCurrentSpace(officeSpace.id);
      setCurrentVisitorId(result.id);
    } catch (error) {
      console.error('Failed to enter office:', error);
    }
  };
  
  const handleLeaveOffice = async () => {
    if (!currentSpace) return;
    
    try {
      await leaveSpace.mutateAsync(currentSpace);
      setCurrentSpace(null);
      setCurrentVisitorId(null);
    } catch (error) {
      console.error('Failed to leave office:', error);
    }
  };
  
  const handlePositionUpdate = (position: { x: number; y: number; z: number }) => {
    if (!currentVisitorId) return;
    updatePosition.mutate({ visitorId: currentVisitorId, position });
  };
  
  const handleToggleSpeaking = () => {
    if (!currentVisitorId) return;
    const newSpeakingState = !isSpeaking;
    setIsSpeaking(newSpeakingState);
    toggleSpeaking.mutate({ visitorId: currentVisitorId, isSpeaking: newSpeakingState });
  };
  
  if (!currentSpace) {
    return (
      <div className="relative w-full h-[600px] rounded-xl overflow-hidden bg-gradient-to-br from-purple-900/50 via-black to-blue-900/50 border border-purple-500/30">
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-center space-y-6">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <MapPin className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white">ProfitReaper Metaverse HQ</h3>
            <p className="text-purple-300 max-w-md">
              Enter our virtual headquarters. Meet team members, view products in 3D, 
              and participate in live DAO discussions.
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{officeSpace?.current_visitors || 0} online</span>
              </div>
              <Badge variant="outline" className="border-green-500 text-green-400">
                Live
              </Badge>
            </div>
            <Button 
              size="lg"
              onClick={handleEnterOffice}
              disabled={enterSpace.isPending}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {enterSpace.isPending ? 'Entering...' : 'Enter Metaverse Office'}
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`relative rounded-xl overflow-hidden border border-purple-500/30 ${isFullscreen ? 'fixed inset-0 z-50' : 'w-full h-[600px]'}`}>
      {/* Controls overlay */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
          <Users className="w-3 h-3 mr-1" />
          {visitors.length} in office
        </Badge>
        <Button
          size="sm"
          variant="outline"
          onClick={handleToggleSpeaking}
          className={isSpeaking ? 'bg-green-500/20 border-green-500' : ''}
        >
          {isSpeaking ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsFullscreen(!isFullscreen)}
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={handleLeaveOffice}
        >
          <LogOut className="w-4 h-4 mr-1" />
          Leave
        </Button>
      </div>
      
      {/* Instructions */}
      <div className="absolute bottom-4 left-4 z-10 bg-black/60 px-3 py-2 rounded-lg text-sm text-white">
        <div className="flex items-center gap-4">
          <span>WASD to move</span>
          <span>Mouse to look</span>
          <span>Scroll to zoom</span>
        </div>
      </div>
      
      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 5, 10], fov: 60 }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <Scene visitors={visitors} currentUserId={user?.id || null} />
          <PlayerController onMove={handlePositionUpdate} />
          <OrbitControls 
            maxPolarAngle={Math.PI / 2.1}
            minDistance={3}
            maxDistance={20}
            enablePan={false}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
