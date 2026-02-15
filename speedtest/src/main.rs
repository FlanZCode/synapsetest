use futures_util::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::sync::{Arc, Mutex};
use tokio::net::{TcpListener, TcpStream};
use tokio::time::{sleep, Duration};
use tokio_tungstenite::accept_async;
use tokio_tungstenite::tungstenite::Message;
use synapse_rs::NetworkData;

#[derive(Serialize, Clone, Debug)]
struct SpeedData {
    ping: f64,
    jitter: f64,
    down: f64,
    up: f64,
    loss: f64,
    vortex: f64,
}

#[derive(Deserialize, Debug)]
struct ClientMessage {
    #[serde(rename = "type")]
    msg_type: String,
    duration: Option<u64>,
}

#[tokio::main]
async fn main() {
    let addr = "127.0.0.1:9001";
    let listener = TcpListener::bind(&addr).await.expect("Failed to bind port 9001");
    println!("Server listening on: {}", addr);

    while let Ok((stream, _)) = listener.accept().await {
        tokio::spawn(handle_connection(stream));
    }
}

async fn handle_connection(stream: TcpStream) {
    let ws_stream = accept_async(stream).await.expect("WS handshake error");
    println!("New client connected");

    let (ws_sender, mut ws_receiver) = ws_stream.split();
    let ws_sender = Arc::new(tokio::sync::Mutex::new(ws_sender));

    let is_running = Arc::new(Mutex::new(false));
    let current_task: Arc<tokio::sync::Mutex<Option<tokio::task::JoinHandle<()>>>> = Arc::new(tokio::sync::Mutex::new(None));

    while let Some(msg) = ws_receiver.next().await {
        let msg = match msg {
            Ok(Message::Text(s)) => s,
            Ok(Message::Close(_)) => break,
            _ => continue,
        };

        if let Ok(client_msg) = serde_json::from_str::<ClientMessage>(&msg) {
            match client_msg.msg_type.as_str() {
                "start" => {
                    let duration_secs = client_msg.duration.unwrap_or(15);
                    println!("Start command received for {}s", duration_secs);

                    {
                        let mut lock = is_running.lock().unwrap();
                        if *lock {
                            continue;
                        }
                        *lock = true;
                    }

                    let running_clone = is_running.clone();
                    let sender_clone = ws_sender.clone();

                    let handle = tokio::spawn(async move {
                        for _ in 0..duration_secs * 10 {
                            let should_stop = {
                                !*running_clone.lock().unwrap()
                            };

                            if should_stop {
                                break;
                            }

                            let ping_val = 15.0 + (rand::random::<f64>() * 5.0);
                            let jitter_val = 2.0 + (rand::random::<f64>() * 3.0);
                            let down_val = 450.0 + (rand::random::<f64>() * 50.0);
                            let up_val = 200.0 + (rand::random::<f64>() * 30.0);
                            let loss_val = if rand::random::<f64>() > 0.95 { 0.2 } else { 0.0 };

                            let net_data = NetworkData {
                                down_mbps: Some(down_val),
                                up_mbps: Some(up_val),
                                ping_ms: Some(ping_val),
                                jitter_ms: Some(jitter_val),
                                packet_loss_percent: Some(loss_val),
                                ..Default::default()
                            };

                            let vortex_score = net_data.calculate_vortex().unwrap_or(0.0);

                            let data = SpeedData {
                                ping: ping_val,
                                jitter: jitter_val,
                                down: down_val,
                                up: up_val,
                                loss: loss_val,
                                vortex: vortex_score,
                            };

                            let response = json!({
                                "type": "data",
                                "data": data
                            });

                            let mut sender = sender_clone.lock().await;
                            if sender.send(Message::Text(response.to_string())).await.is_err() {
                                break;
                            }
                            drop(sender);

                            sleep(Duration::from_millis(100)).await;
                        }

                        let mut sender = sender_clone.lock().await;
                        let _ = sender.send(Message::Text(json!({"type": "end"}).to_string())).await;

                        {
                            let mut lock = running_clone.lock().unwrap();
                            *lock = false;
                        }
                    });

                    let mut task_lock = current_task.lock().await;
                    *task_lock = Some(handle);
                },
                "stop" => {
                    println!("Stop command received");
                    let mut lock = is_running.lock().unwrap();
                    *lock = false;
                },
                _ => {}
            }
        }
    }
    println!("Client disconnected");
}
