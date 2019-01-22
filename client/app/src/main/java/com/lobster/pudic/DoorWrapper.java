package com.lobster.pudic;

import com.google.gson.annotations.SerializedName;

public class DoorWrapper {

    @SerializedName("1")
    private Boolean doorIsOpened;

    public DoorWrapper() {

    }

    public DoorWrapper(Boolean doorIsOpened) {
        this.doorIsOpened = doorIsOpened;
    }

    public Boolean getDoorIsOpened() {
        return doorIsOpened;
    }

    public void setDoorIsOpened(Boolean doorIsOpened) {
        this.doorIsOpened = doorIsOpened;
    }
}
