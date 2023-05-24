import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
})
export class VideoPlayerComponent implements OnInit {
  @Input() set id(value: string) {
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube-nocookie.com/embed/${value}/?controls=1&autoplay=1`
    );
  }
  url: any;
  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {}
}
