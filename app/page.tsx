import { Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CreateRoomForm } from '@/components/create-room-form';
import { JoinRoomForm } from '@/components/join-room-form';

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <Search className="mx-auto h-12 w-12 text-blue-600" />
          <h1 className="text-3xl font-bold tracking-tight">Lost & Found</h1>
          <p className="text-gray-500">
            Create a room for your event or join an existing one.
          </p>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Create Room</CardTitle>
              <CardDescription>
                Start a new lost & found room for your event
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateRoomForm />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Join Room</CardTitle>
              <CardDescription>
                Enter a room code to join an existing room
              </CardDescription>
            </CardHeader>
            <CardContent>
              <JoinRoomForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
