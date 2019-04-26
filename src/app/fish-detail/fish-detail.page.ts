import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-fish-detail',
  templateUrl: './fish-detail.page.html',
  styleUrls: ['./fish-detail.page.scss'],
})
export class FishDetailPage implements OnInit {

  constructor(
    private route: ActivatedRoute,
  ) {
    this.route.params.subscribe(param => {
      console.log(param)
    });
  }

  ngOnInit() {
  }

}
