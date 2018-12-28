import 'reflect-metadata';
import { DoodadLoader } from 'bawt/game/DoodadLoader';
import { suite, test } from 'mocha-typescript';
import { Observable } from 'rxjs';
import { IADTCollection } from 'bawt/game/AdtState';
import { spy, SinonSpy } from 'sinon';
import { Mock, It, IMock } from 'typemoq';
import { IAssetProvider } from 'interface/IAssetProvider';
import { ISceneObject } from 'interface/ISceneObject';
import { expect } from 'chai';
import { Object3D } from 'three';
import { makeAdt } from 'bawt/utils/data/adt';
import { makeChunk } from 'bawt/utils/data/chunks';
import { makeDoodad } from 'bawt/utils/data/doodad';

const initialAdtData: IADTCollection = {
  added: [],
  deleted: [],
  current: [],
};

@suite
class DoodadLoaderTester {
  private mockAdtCollection: IMock<Observable<IADTCollection>> = Mock.ofType<Observable<IADTCollection>>();
  private adtCollectionObserver: any = null;

  private mockSceneObject: IMock<ISceneObject> = Mock.ofType<ISceneObject>();
  private sceneObject: Object3D = new Object3D();

  private mockModelAssetProvider: IMock<IAssetProvider<ISceneObject>> = Mock.ofType< IAssetProvider<ISceneObject>>();

  private doodadLoader: DoodadLoader|null = null;
  private doodadSubjectSpy: SinonSpy = spy();

  private adtData: IADTCollection = {
    added: [],
    deleted: [],
    current: [],
  };

  public before() {
    this.mockAdtCollection = Mock.ofType<Observable<IADTCollection>>();
    this.mockAdtCollection.setup((x: Observable<IADTCollection>) => x.subscribe( It.isAny()))
      .callback(((param1: any) => {
        this.adtCollectionObserver = param1;
      }));

    this.mockSceneObject = Mock.ofType<ISceneObject>();
    this.sceneObject = new Object3D();
    this.mockSceneObject.setup((x: ISceneObject) => x.object3d).returns(() => this.sceneObject);
    this.mockSceneObject.setup((x: any) => x.then).returns(() => undefined);

    this.mockModelAssetProvider = Mock.ofType< IAssetProvider<ISceneObject>>();
    this.mockModelAssetProvider.setup((x: IAssetProvider<ISceneObject>) => x.start(It.isAny()))
      .returns(() => Promise.resolve(this.mockSceneObject!.object));

    this.doodadLoader = new DoodadLoader(this.mockAdtCollection.object, this.mockModelAssetProvider.object);

    this.doodadSubjectSpy = spy();
    this.doodadLoader.doodadSubject.subscribe(this.doodadSubjectSpy);

    this.setAdtData([], [], [], []);
  }

  private async waitUntil(condition: () => boolean) {
    let done = false;
    while (!done) {
      await new Promise((resolve) => setTimeout(resolve, 15));
      done = condition();
    }
  }

  private setAdtData( added: Array<{ mcnkIndex: number, chunkId: number}>,
                      current: Array<{ mcnkIndex: number, chunkId: number}>,
                      deleted: number[],
                      chunks: blizzardry.IMCNKs[]) {
    const mockAdt = makeAdt();
    this.adtData.added = [];
    this.adtData.current = [];
    this.adtData.deleted = [];
    for (const addedEntry of added) {
      this.adtData.added.push({
        mcnkIndex: addedEntry.mcnkIndex,
        chunkId: addedEntry.chunkId,
        tileX: 0,
        tileY: 0,
        chunkX: 0,
        chunkY: 0,
        adt: mockAdt,
      });
    }
    for (const currentEntry of current) {
      this.adtData.current.push({
        mcnkIndex: currentEntry.mcnkIndex,
        chunkId: currentEntry.chunkId,
        tileX: 0,
        tileY: 0,
        chunkX: 0,
        chunkY: 0,
        adt: mockAdt,
      });
    }
    for (const deletedNumber of deleted) {
      this.adtData.deleted.push(deletedNumber);
    }
    for (const chunk of chunks) {
      mockAdt.MCNKs.push(chunk);
    }
  }

  @test('add 2 chunks - 2 doodads/chunk')
  private async addOneChunk() {
    await this.adtCollectionObserver.next(this.adtData);

    expect(this.doodadSubjectSpy.calledOnce).to.equal(true);

    // add chunks and doodads
    const chunk0 = makeChunk();
    chunk0.MCRF.doodadEntries.push(makeDoodad({ id: 0, filename: 'test1.m2'}));
    chunk0.MCRF.doodadEntries.push(makeDoodad({ id: 1, filename: 'test2.m2'}));
    const chunk1 = makeChunk();
    chunk1.MCRF.doodadEntries.push(makeDoodad({ id: 2, filename: 'test3.m2'}));
    chunk1.MCRF.doodadEntries.push(makeDoodad({ id: 3, filename: 'test4.m2'}));

    this.setAdtData([{ mcnkIndex: 0, chunkId: 100}, { mcnkIndex: 1, chunkId: 200}], [], [], [chunk0, chunk1]);

    this.adtCollectionObserver.next(this.adtData);

    await this.waitUntil(() => {
      return this.doodadSubjectSpy.callCount === 5;
    });

    expect(this.doodadSubjectSpy.args.length).to.equal(5);

    const arg0 = this.doodadSubjectSpy.args[0][0] as IADTCollection;
    expect(arg0.added.length).to.equal(0);
    expect(arg0.current.length).to.equal(0);
    expect(arg0.deleted.length).to.equal(0);

    const arg1 = this.doodadSubjectSpy.args[1][0] as IADTCollection;
    expect(arg1.added.length).to.equal(1);
    expect(arg1.current.length).to.equal(0);
    expect(arg1.deleted.length).to.equal(0);

    const arg2 = this.doodadSubjectSpy.args[2][0] as IADTCollection;
    expect(arg2.added.length).to.equal(1);
    expect(arg2.current.length).to.equal(1);
    expect(arg2.deleted.length).to.equal(0);

    const arg3 = this.doodadSubjectSpy.args[3][0] as IADTCollection;
    expect(arg3.added.length).to.equal(1);
    expect(arg3.current.length).to.equal(2);
    expect(arg3.deleted.length).to.equal(0);

    const arg4 = this.doodadSubjectSpy.args[4][0] as IADTCollection;
    expect(arg4.added.length).to.equal(1);
    expect(arg4.current.length).to.equal(3);
    expect(arg4.deleted.length).to.equal(0);

  }

  @test('add 2chunks - delete 1 chunk')
  private async addTwoChunks() {
    await this.adtCollectionObserver.next(this.adtData);

    expect(this.doodadSubjectSpy.calledOnce).to.equal(true);

    // add chunks and doodads
    const chunk0 = makeChunk();
    chunk0.MCRF.doodadEntries.push(makeDoodad({ id: 1, filename: 'test1.m2'}));
    chunk0.MCRF.doodadEntries.push(makeDoodad({ id: 2, filename: 'test2.m2'}));
    const chunk1 = makeChunk();
    chunk1.MCRF.doodadEntries.push(makeDoodad({ id: 3, filename: 'test3.m2'}));
    chunk1.MCRF.doodadEntries.push(makeDoodad({ id: 4, filename: 'test4.m2'}));

    this.setAdtData([{ mcnkIndex: 0, chunkId: 100}, { mcnkIndex: 1, chunkId: 200}], [], [], [chunk0, chunk1]);

    this.adtCollectionObserver.next(this.adtData);

    await this.waitUntil(() => {
      return this.doodadSubjectSpy.callCount === 5;
    });

    expect(this.doodadSubjectSpy.args.length).to.equal(5);

    this.setAdtData([], [{mcnkIndex: 0, chunkId: 100 }], [200], [chunk0, chunk1]);

    this.adtCollectionObserver.next(this.adtData);

    await this.waitUntil(() => {
      return this.doodadSubjectSpy.callCount === 6;
    });

    expect(this.doodadSubjectSpy.args.length).to.equal(6);

    const arg5 = this.doodadSubjectSpy.args[5][0] as IADTCollection;
    expect(arg5.added.length).to.equal(0);
    expect(arg5.current.length).to.equal(2);
    expect(arg5.deleted.length).to.equal(2);
  }

  @test('add 1 chunk and cancel')
  private async test3() {
    await this.adtCollectionObserver.next(this.adtData);

    expect(this.doodadSubjectSpy.calledOnce).to.equal(true);

    // add chunks and doodads
    const chunk0 = makeChunk();
    chunk0.MCRF.doodadEntries.push(makeDoodad({ id: 0, filename: 'test0.m2'}));
    chunk0.MCRF.doodadEntries.push(makeDoodad({ id: 1, filename: 'test1.m2'}));

    this.setAdtData([{ mcnkIndex: 0, chunkId: 100}], [], [], [chunk0]);

    this.adtCollectionObserver.next(this.adtData);

    this.setAdtData([], [], [100], [chunk0]);

    this.adtCollectionObserver.next(this.adtData);

    await this.waitUntil(() => {
      return this.doodadSubjectSpy.callCount === 4;
    });
  }
}
