using Microsoft.AspNetCore.SignalR;

namespace TsTest2.Hubs
{
    public class PingHub : Hub
    {
        private static Dictionary<string, string?> clients = new Dictionary<string,string?>();
        private static string? waitingPlayerId = null;
        private static string? waitingPlayerName = null;
        //public async Task SendMessage(string user, string message)
        //{
        //    await Clients.All.SendAsync("ReceiveMessage", user, message);
        //}
        public async Task JoinGame(string newBallAngle, string playerName)
        {
            
            if (clients.Count % 2 == 0)
            {
                waitingPlayerId = Context.ConnectionId;
                waitingPlayerName = playerName;
                clients.Add(waitingPlayerId, null);
            }
            else
            {
                if (playerName != waitingPlayerName)
                {
                    var newPlayer = Context.ConnectionId;
                    clients[waitingPlayerId!] = newPlayer;
                    clients.Add(newPlayer, waitingPlayerId);

                    // inform both players to start play
                    await Clients.Client(waitingPlayerId!).SendAsync("StartPlay", "1", newBallAngle, playerName);
                    await Clients.Caller.SendAsync("StartPlay", "-1", newBallAngle, waitingPlayerName);

                    waitingPlayerId = null;
                    waitingPlayerName= null;
                }
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
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            if (Context.ConnectionId == waitingPlayerId)
            {
                waitingPlayerId = null;
                waitingPlayerName = null;
                if (clients.ContainsKey(Context.ConnectionId)) clients.Remove(Context.ConnectionId);
            }
            else if (clients.ContainsKey(Context.ConnectionId))
            {
                // tell the 'value' player/connection that this player has left the game
                var leavingPlayer = clients[Context.ConnectionId];
                clients.Remove(Context.ConnectionId);
                await Clients.Client(leavingPlayer!).SendAsync("PlayerLeft");
            }
            else if (clients.ContainsValue(Context.ConnectionId))
            {
                // tell the 'key' player/connection that this player has left the game
                var leavingPlayer = clients.First(x => x.Value == Context.ConnectionId).Key;
                clients.Remove(leavingPlayer);
                await Clients.Client(leavingPlayer!).SendAsync("PlayerLeft");
            }
            await base.OnDisconnectedAsync(exception);
        }
    }
}
