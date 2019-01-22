package com.lobster.pudic;

import com.google.gson.annotations.SerializedName;

public class RoomTemperature {

    @SerializedName("0")
    private Float notUsed;

    @SerializedName("1")
    private Float temperature;

    public RoomTemperature() {

    }

    public RoomTemperature(Float temperature) {
        this.notUsed = 0.0f;
        this.temperature = temperature;
    }

    public Float getNotUsed() {
        return notUsed;
    }

    public void setNotUsed(Float notUsed) {
        this.notUsed = notUsed;
    }

    public Float getTemperature() {
        return temperature;
    }

    public void setTemperature(Float temperature) {
        this.temperature = temperature;
    }
}
