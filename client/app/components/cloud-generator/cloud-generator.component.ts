import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';

import { WonderService } from '../../services/wonder/wonder.service';
import { SocketService } from '../../services/socketio/socketio.service';

import { Wonder, cloneWonders } from '../../models/models.namespace';
import CloudProps from './cloud-props';

@Component({
  selector: 'cloud-generator',
  providers: [WonderService],
  templateUrl: './cloud-generator.component.html',
  styleUrls: ['./cloud-generator.component.scss']
})

export class CloudGeneratorComponent{
  @ViewChild('wonderSky') wonderSky;

  private socket;
  cloudStyle = CloudProps.cloudStyle;
  cloudAnima = CloudProps.cloudAnima;

  beforeWonders: Wonder[];
  afterWonders: Wonder[];

  errorMessage: string;
  dream = 'Wonders';
  wonderName;

  constructor(private wonderService: WonderService) {
    this.socket = new SocketService();
  }

  ngOnInit() {
    this.wonderService.getWonders()
      .subscribe(wonders => {
        this.beforeWonders = wonders;

        this.afterWonders = cloneWonders(wonders);
        this.afterWonders.forEach((item, index) => CloudProps.cloudType(item.name.length, index));

        this.socket.syncUpdates('Wonder', this.beforeWonders, (item, index) => {
          CloudProps.cloudAnimaAfter(this.wonderSky.nativeElement.children[index], this.afterWonders, item, index);
        });
      });
  }

  ngOnDestroy() {
    CloudProps.reset();
    this.socket.unsyncUpdates('Wonder');
  }

  saveWonder(name: string) {
    this.wonderService.saveWonder(name).subscribe();
  }

}
