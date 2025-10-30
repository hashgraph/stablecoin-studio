package com.example.niasync;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class BootReceiverNiaSync extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) {
            Log.d("BootReceiverNiaSync", "Téléphone redémarré — Flutter gérera le service au prochain lancement de l'app");
        }
    }
}
