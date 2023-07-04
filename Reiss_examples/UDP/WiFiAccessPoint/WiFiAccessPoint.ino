/*
   Copyright (c) 2015, Majenko Technologies
   All rights reserved.

   Redistribution and use in source and binary forms, with or without modification,
   are permitted provided that the following conditions are met:

 * * Redistributions of source code must retain the above copyright notice, this
     list of conditions and the following disclaimer.

 * * Redistributions in binary form must reproduce the above copyright notice, this
     list of conditions and the following disclaimer in the documentation and/or
     other materials provided with the distribution.

 * * Neither the name of Majenko Technologies nor the names of its
     contributors may be used to endorse or promote products derived from
     this software without specific prior written permission.

   THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
   ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
   WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
   DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
   ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
   (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
   LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
   ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
   (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
   SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/* Create a WiFi access point and provide a web server on it. */

#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <WiFiUdp.h>
#include <ESP8266WebServer.h>

#ifndef APSSID
#define APSSID "ESPap"
#define APPSK "thereisnospoon"
#endif

const byte client = 1;

/* Set these to your desired credentials. */
const char *ssid = APSSID;
const char *password = APPSK;

//ESP8266WebServer server(80);

/* Just a little test message.  Go to http://192.168.4.1 in a web browser
   connected to this access point to see it.
*/
// void handleRoot() {
//   server.send(200, "text/html", "<h1>You are connected</h1>");
// }

unsigned int localPort = 8888 + client;  // local port to listen on
IPAddress BroadcastIP(192,168,4,255);
IPAddress RemoteIP(192,168,4,2);
uint16_t BroadcastPort = 8888;

// buffers for receiving and sending data
char packetBuffer[UDP_TX_PACKET_MAX_SIZE + 1];  // buffer to hold incoming packet,
char ReplyBuffer[] = "acknowledged\r\n";        // a string to send back

WiFiUDP Udp;

void setup() {
  delay(1000);
  Serial.begin(115200);
  Serial.println();
  Serial.print("Configuring access point...");
  /* You can remove the password parameter if you want the AP to be open. */
  WiFi.softAP(ssid, password);

  IPAddress myIP = WiFi.softAPIP();
  Serial.print("AP IP address: ");
  Serial.println(myIP);

  Udp.begin(localPort);
}

void loop() {
    // if there's data available, read a packet
  int packetSize = Udp.parsePacket();
  if (packetSize) {
    Serial.printf("Received packet of size %d from %s:%d\n    (to %s:%d)\n", packetSize, Udp.remoteIP().toString().c_str(), Udp.remotePort(), Udp.destinationIP().toString().c_str(), Udp.localPort());

    // read the packet into packetBufffer
    int n = Udp.read(packetBuffer, UDP_TX_PACKET_MAX_SIZE);
    packetBuffer[n] = 0;
    Serial.println("Contents:");
    Serial.println(packetBuffer);

    // send a reply, to the IP address and port that sent us the packet we received
    Udp.beginPacket(Udp.remoteIP(), Udp.remotePort());
    Udp.write(ReplyBuffer);
    Udp.endPacket();
  }

  static uint32_t timer = 0;
  int interval = 50;
  static byte valR = 0;
  static byte valG = 20;
  static byte valB = 100;
  static byte val[] = {0,100,200,20,30,50};
  static byte dir[] = {0,0,0,1,1,1};
  static byte inc[] = {1,3,2,8,2,15};
  static byte channel = 1;


  if(millis()-timer>interval){
    timer=millis();

    for(byte i=0;i<6;i++){
      val[i] = dir[i]==0 ? val[i]-inc[i] : val[i]+inc[i];
      if(val[i]>250) dir[i]=0;
      else if(val[i]<5) dir[i]=1;
      Serial.print( String(val[i]) + " ");
    }

    //Udp.beginPacket(BroadcastIP, BroadcastPort); // subnet Broadcast IP and port
    Udp.beginPacket(RemoteIP, BroadcastPort); // subnet Broadcast IP and port
    Udp.write(11);
    //Udp.write(channel);
    for(int i=0;i<4;i++){
      Udp.write(val[0]);
      Udp.write(val[1]);
      Udp.write(val[2]);
    }
    for(int i=0;i<4;i++){
      Udp.write(val[4]);
      Udp.write(val[5]);
      Udp.write(val[6]);
    }

    Udp.endPacket();
    Serial.println("broadcasting");
  }
  channel = channel>6 ? 0 : channel+1;
}
