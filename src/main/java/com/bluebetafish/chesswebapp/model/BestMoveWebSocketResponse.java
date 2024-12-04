package com.bluebetafish.chesswebapp.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@AllArgsConstructor
@NoArgsConstructor
@ToString
@Data
public class BestMoveWebSocketResponse {
    @JsonProperty(value = "status")
    String status;

    @JsonProperty(value = "fen")
    String fen;

    @JsonProperty(value = "moveTime")
    long moveTime;

    String webSocketSessionId;

    String bestMove;
}
