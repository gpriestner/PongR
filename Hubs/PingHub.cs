using Microsoft.AspNetCore.SignalR;

namespace TsTest2.Hubs
{
    public class PingHub : Hub
    {
        private static Dictionary<string, string?> clients = new Dictionary<string,string?>();
        private static string? waitingPlayer = null;
        //public async Task SendMessage(string user, string message)
        //{
        //    await Clients.All.SendAsync("ReceiveMessage", user, message);
        //}
        public async Task JoinGame(string newBallAngle)
        {
            
            if (clients.Count % 2 == 0)
            {
                waitingPlayer = Context.ConnectionId;
                clients.Add(waitingPlayer, null);
            }
            else
            {
                var newPlayer = Context.ConnectionId;
                clients[waitingPlayer!] = newPlayer;
                clients.Add(newPlayer, waitingPlayer);

                // inform both players to start play
                await Clients.Client(waitingPlayer!).SendAsync("StartPlay", "1", newBallAngle);
                await Clients.Caller.SendAsync("StartPlay", "-1", newBallAngle);

                waitingPlayer = null;
            }
        }
        public async Task KeyUp(string key, float y)
        {
            var otherPlayer = clients[Context.ConnectionId];
            await Clients.Client(otherPlayer!).SendAsync("KeyUp", key, y);
        }
        public async Task KeyDown(string key)
        {
            var otherPlayer = clients[Context.ConnectionId];
            await Clients.Client(otherPlayer!).SendAsync("KeyDown", key);
        }
        public async Task UpdateBall(float x, float y, float dx, float dy)
        {
            var otherPlayer = clients[Context.ConnectionId];
            await Clients.Client(otherPlayer!).SendAsync("UpdateBall", x, y, dx, dy);
        }

        public override Task OnDisconnectedAsync(Exception? exception)
        {
            return base.OnDisconnectedAsync(exception);
        }
    }
}
