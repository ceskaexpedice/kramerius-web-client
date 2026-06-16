import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AppSettings } from '../services/app-settings';
import { HistoryService } from '../services/history.service';
import { KrameriusApiService } from '../services/kramerius-api.service';
import { DocumentItem } from '../model/document_item.model';
import { NotFoundError } from '../common/errors/not-found-error';

type ContextItem = DocumentItem['context'][number];

@Component({
  selector: 'app-persistent-link',
  templateUrl: './persistent-link.component.html'
})
export class PersistentLinkComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appSettings: AppSettings,
    private history: HistoryService,
    private api: KrameriusApiService
  ) {}

  ngOnInit(): void {
    combineLatest([this.route.paramMap, this.route.queryParams])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([params, queryParams]) => {
        const uuid = params.get('uuid');
        if (!uuid) {
          this.navigateTo404();
          return;
        }

        this.api.getItem(uuid)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (item) => this.resolveLink(item, queryParams['fulltext'], queryParams['bb']),
            error: (error) => {
              if (error instanceof NotFoundError) {
                this.navigateTo404();
              }
            }
          });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private navigateTo404(): void {
    this.router.navigateByUrl(this.appSettings.getRouteFor('404'), { skipLocationChange: true });
  }

  private getParentContext(item: DocumentItem, offset = 2): ContextItem | undefined {
    return item.context?.[item.context.length - offset];
  }

  private resolveParentForPage(item: DocumentItem): ContextItem | undefined {
    let parent = this.getParentContext(item);
    if (parent?.doctype === 'supplement') {
      const grandparent = this.getParentContext(item, 3);
      // Pro page: přeskočit supplement, ALE ne pokud by to vedlo na periodicalvolume (příloha ročníku)
      if (grandparent?.uuid && grandparent.doctype !== 'periodicalvolume') {
        parent = grandparent;
      }
    }
    return parent;
  }

  private resolveParentForArticle(item: DocumentItem): ContextItem | undefined {
    let parent = this.getParentContext(item);
    if (parent?.doctype === 'supplement') {
      const grandparent = this.getParentContext(item, 3);
      // Pro article: přeskočit supplement vždy
      if (grandparent?.uuid) {
        parent = grandparent;
      }
    }
    return parent;
  }

  private resolveLink(item: DocumentItem, fulltext?: string, bb?: string): void {
    this.history.removeCurrent();

    switch (item.doctype) {
      case 'page': {
        const parent = this.resolveParentForPage(item);
        if (parent?.uuid) {
          this.router.navigate(['/view', parent.uuid], { queryParams: { page: item.uuid, fulltext, bb } });
        } else {
          this.navigateTo404();
        }
        break;
      }

      case 'article': {
        const parent = this.resolveParentForArticle(item);
        if (parent?.uuid) {
          this.router.navigate(['/view', parent.uuid], { queryParams: { article: item.uuid } });
        } else {
          this.navigateTo404();
        }
        break;
      }

      case 'periodical':
      case 'periodicalvolume':
      case 'convolute':
        this.router.navigate(['/periodical', item.uuid], { queryParams: { fulltext } });
        break;

      case 'soundrecording':
        this.router.navigate(['/music', item.uuid]);
        break;

      case 'soundunit':
      case 'track':
        this.handleSoundNavigation(item);
        break;

      case 'supplement':
        this.handleSupplementNavigation(item);
        break;

      case 'collection':
        this.router.navigate(['/collection', item.uuid]);
        break;

      default:
        this.router.navigate(['/view', item.uuid], { queryParams: { fulltext } });
    }
  }

  private handleSoundNavigation(item: DocumentItem): void {
    const soundrecording = item.context?.find(ctx => ctx.doctype === 'soundrecording');
    if (soundrecording?.uuid) {
      if (item.doctype === 'track') {
        this.router.navigate(['/music', soundrecording.uuid], {
          replaceUrl: true,
          queryParams: { track: item.uuid }
        });
      } else {
        this.router.navigate(['/music', soundrecording.uuid]);
      }
    } else {
      this.navigateTo404();
    }
  }

  private handleSupplementNavigation(item: DocumentItem): void {
    const parent = this.getParentContext(item);

    if (parent?.doctype === 'periodicalvolume') {
      this.router.navigate(['/view', item.uuid]);
      return;
    }

    if (!parent?.uuid) {
      this.router.navigate(['/view', item.uuid]);
      return;
    }

    this.api.getChildren(item.uuid)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (children) => {
          const queryParams = children?.[0]?.pid ? { page: children[0].pid } : undefined;
          this.router.navigate(['/view', parent.uuid], { queryParams });
        },
        error: () => {
          this.router.navigate(['/view', parent.uuid]);
        }
      });
  }
}
