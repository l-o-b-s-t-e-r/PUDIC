package com.lobster.pudic;

import com.google.gson.annotations.SerializedName;

public class WindowsWrapper {

    @SerializedName("1")
    private Boolean window1IsOpened;

    @SerializedName("2")
    private Boolean window2IsOpened;

    public WindowsWrapper() {

    }

    public WindowsWrapper(Boolean window1IsOpened, Boolean window2IsOpened) {
        this.window1IsOpened = window1IsOpened;
        this.window2IsOpened = window2IsOpened;
    }

    public Boolean getWindow1IsOpened() {
        return window1IsOpened;
    }

    public void setWindow1IsOpened(Boolean window1IsOpened) {
        this.window1IsOpened = window1IsOpened;
    }

    public Boolean getWindow2IsOpened() {
        return window2IsOpened;
    }

    public void setWindow2IsOpened(Boolean window2IsOpened) {
        this.window2IsOpened = window2IsOpened;
    }
}
